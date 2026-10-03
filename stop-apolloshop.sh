#!/usr/bin/env bash
set -euo pipefail

PID_DIR="${TMPDIR:-/tmp}/apolloshop"
API_PID_FILE="$PID_DIR/api.pid"
UI_PID_FILE="$PID_DIR/ui.pid"

stop_pid_file() {
  local file="$1"
  local name="$2"
  if [[ ! -f "$file" ]]; then
    echo "[..] no $name pid file"
    return 0
  fi
  local pid
  pid="$(cat "$file" 2>/dev/null || true)"
  if [[ -z "$pid" ]]; then
    rm -f "$file"
    return 0
  fi
  if kill -0 "$pid" 2>/dev/null; then
    echo "[..] stopping $name (pid $pid)"
    # Kill process group (start_new_session) then the pid itself
    kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    pkill -TERM -P "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
      pkill -KILL -P "$pid" 2>/dev/null || true
    fi
  else
    echo "[..] $name pid $pid not running"
  fi
  rm -f "$file"
}

free_port() {
  local port="$1"
  local pids
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    echo "[ok] port $port free"
    return 0
  fi
  echo "[..] killing listeners on $port: $pids"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 1
  pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

echo "=== ApolloShop stop ==="
stop_pid_file "$UI_PID_FILE" "UI"
stop_pid_file "$API_PID_FILE" "API"
free_port 3000
free_port 5080
echo "=== stopped (sqlserver left running) ==="
