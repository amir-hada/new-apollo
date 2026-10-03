#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT/apollo.shop.api/src/ApolloShop.Api"
UI_DIR="$ROOT/apollo.shop.ui"
PID_DIR="${TMPDIR:-/tmp}/apolloshop"
API_LOG="/tmp/apolloshop-api.log"
UI_LOG="/tmp/apolloshop-ui.log"
API_PID_FILE="$PID_DIR/api.pid"
UI_PID_FILE="$PID_DIR/ui.pid"

mkdir -p "$PID_DIR"

is_listening() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

pid_alive() {
  local pid="$1"
  [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null
}

ensure_sqlserver() {
  if docker ps --format '{{.Names}}' | grep -qx 'sqlserver'; then
    echo "[ok] sqlserver already running"
    return 0
  fi
  if docker ps -a --format '{{.Names}}' | grep -qx 'sqlserver'; then
    echo "[..] starting sqlserver container"
    docker start sqlserver >/dev/null
  else
    echo "[!!] container 'sqlserver' not found. Create it or update this script."
    exit 1
  fi
  for _ in $(seq 1 30); do
    if docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -C -Q 'SELECT 1' >/dev/null 2>&1 \
      || docker exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -Q 'SELECT 1' >/dev/null 2>&1; then
      echo "[ok] sqlserver ready"
      return 0
    fi
    sleep 1
  done
  echo "[warn] sqlserver started but health check timed out; continuing anyway"
}

stop_stale_on_port() {
  local port="$1"
  local pids
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi
  echo "[..] freeing port $port (pids: $pids)"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 1
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

# Double-fork daemon so children survive Cursor/terminal session teardown (macOS has no setsid).
daemon_run() {
  local pid_file="$1"
  local log_file="$2"
  local workdir="$3"
  shift 3
  python3 - "$pid_file" "$log_file" "$workdir" "$@" <<'PY'
import os, sys, subprocess, time

pid_file, log_file, workdir, *cmd = sys.argv[1:]

# First fork
if os.fork() > 0:
    sys.exit(0)

os.setsid()

# Second fork
if os.fork() > 0:
    sys.exit(0)

os.chdir(workdir)
os.umask(0)

# Close stdio and reopen to log
sys.stdin.close()
with open(log_file, "ab", buffering=0) as log:
    os.dup2(log.fileno(), 1)
    os.dup2(log.fileno(), 2)
    # Start the real process in a new session; write its PID
    proc = subprocess.Popen(
        cmd,
        cwd=workdir,
        stdin=subprocess.DEVNULL,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
        env=os.environ.copy(),
    )
    with open(pid_file, "w") as f:
        f.write(str(proc.pid))
    # Keep daemon supervisor until child exits (optional). Exit immediately so
    # only the child remains; PID file already has child pid.
    # Detach fully:
    os._exit(0)
PY
  # Give python a moment to write the pid file
  for _ in $(seq 1 20); do
    [[ -s "$pid_file" ]] && break
    sleep 0.1
  done
}

start_api() {
  if [[ -f "$API_PID_FILE" ]] && pid_alive "$(cat "$API_PID_FILE")" && is_listening 5080; then
    echo "[ok] API already running (pid $(cat "$API_PID_FILE"))"
    return 0
  fi
  stop_stale_on_port 5080
  : > "$API_LOG"
  echo "[..] starting API on :5080"
  export ASPNETCORE_ENVIRONMENT=Development
  export ASPNETCORE_URLS=http://localhost:5080
  export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=ApolloShop;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=True;MultipleActiveResultSets=true'
  daemon_run "$API_PID_FILE" "$API_LOG" "$API_DIR" dotnet run --no-launch-profile
  echo "[ok] API pid $(cat "$API_PID_FILE") → $API_LOG"
}

start_ui() {
  if [[ -f "$UI_PID_FILE" ]] && pid_alive "$(cat "$UI_PID_FILE")" && is_listening 3000; then
    echo "[ok] UI already running (pid $(cat "$UI_PID_FILE"))"
    return 0
  fi
  stop_stale_on_port 3000
  : > "$UI_LOG"
  echo "[..] starting UI on :3000"
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:5080}"
  export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
  daemon_run "$UI_PID_FILE" "$UI_LOG" "$UI_DIR" npm run dev
  echo "[ok] UI pid $(cat "$UI_PID_FILE") → $UI_LOG"
}

wait_http() {
  local url="$1"
  local name="$2"
  local tries="${3:-60}"
  local code=000
  for i in $(seq 1 "$tries"); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo 000)"
    if [[ "$code" == "200" || "$code" == "301" || "$code" == "302" || "$code" == "307" || "$code" == "308" ]]; then
      echo "[ok] $name → $url ($code)"
      return 0
    fi
    sleep 1
  done
  echo "[!!] $name did not become ready: $url (last=$code). See logs."
  return 1
}

echo "=== ApolloShop start ==="
ensure_sqlserver
start_api
start_ui
wait_http "http://localhost:5080/api/products" "API" 90 || true
wait_http "http://localhost:3000/login" "UI" 90 || true
echo "=== done ==="
echo "API log: $API_LOG"
echo "UI  log: $UI_LOG"
echo "PIDs:    $PID_DIR"
echo "Stop with: $ROOT/stop-apolloshop.sh"
