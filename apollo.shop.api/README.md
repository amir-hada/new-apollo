# ApolloShop API

Backend for **فروشگاه آپولو (ApolloShop)**.

## Stack

.NET 10 · ASP.NET Core · EF Core · SQL Server · MediatR · FluentValidation · JWT · BCrypt

## Solution structure

```
src/
  ApolloShop.Domain
  ApolloShop.Application
  ApolloShop.Infrastructure
  ApolloShop.Persistence
  ApolloShop.Api
tests/
  ApolloShop.Domain.Tests
  ApolloShop.Application.Tests
  ApolloShop.IntegrationTests
```

## Prerequisites

- .NET SDK 10.x
- SQL Server (local or Docker)
- Redis optional (not required for core flows in Dev)

## Configuration

Set connection string via environment or User Secrets:

```bash
export ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=ApolloShop;User Id=sa;Password=Your_password123;TrustServerCertificate=True;MultipleActiveResultSets=true"
```

JWT settings live under `Jwt` in `appsettings.json` (override secrets in Production).

| Setting | Dev default |
|---------|-------------|
| API URL | `http://localhost:5080` |
| Swagger | `http://localhost:5080/swagger` |
| Frontend origin (CORS) | `http://localhost:3000` |

## Run

```bash
cd apollo.shop.api
dotnet restore
dotnet run --project src/ApolloShop.Api --launch-profile http
```

Swagger: `http://localhost:5080/swagger`

On startup the API migrates the database and seeds development data.

## Development seed credentials

| Role  | Email                 | Password     |
|-------|-----------------------|--------------|
| Admin | admin@apolloshop.ir   | Admin@12345  |

Do not use these credentials in Production.

## Tests

```bash
dotnet test
```

Projects:

- **Domain.Tests** — enums, domain exceptions, order total convention
- **Application.Tests** — FluentValidation + handler tests (EF InMemory)
- **IntegrationTests** — `WebApplicationFactory` against InMemory DB (swagger, products, auth, admin 401)

## Docker

From this folder:

```bash
docker compose up --build
```

Services:

| Service | Host port | Notes |
|---------|-----------|--------|
| sqlserver | 1433 | SA password `ApolloShop_Admin123` |
| api | 5080 | maps container `8080` |
| ui | 3000 | Next.js standalone |

Compose sets `ConnectionStrings__DefaultConnection`, `Jwt__Key`, and `Frontend__Origin`. See `appsettings.Docker.json` and `docker-compose.yml`.

## Docs

See [ARCHITECTURE.md](./ARCHITECTURE.md).
