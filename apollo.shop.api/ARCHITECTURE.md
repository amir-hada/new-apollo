# ApolloShop Architecture

## Overview

ApolloShop (فروشگاه آپولو) is a production-oriented e-commerce platform built from [`shop/prompt.md`](../shop/prompt.md).

- Backend: `apollo.shop.api` — .NET 10, Clean Architecture, CQRS (MediatR), EF Core, SQL Server
- Frontend: `apollo.shop.ui` — Next.js App Router, TypeScript, RTL, Vazirmatn, SEO (SSR/SSG)

## Ports & local URLs

| Surface | URL |
|---------|-----|
| API (http profile) | http://localhost:5080 |
| Swagger (Development) | http://localhost:5080/swagger |
| Storefront UI | http://localhost:3000 |
| SQL Server (Docker compose) | localhost:1433 |

## Seed credentials (Development / Docker seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@apolloshop.ir | Admin@12345 |

## Backend layers

| Project | Responsibility |
|---------|----------------|
| ApolloShop.Domain | Entities, enums, domain exceptions — no infra dependencies |
| ApolloShop.Application | Commands/Queries, DTOs, validators, interfaces |
| ApolloShop.Infrastructure | JWT, password hashing, file storage, payment sandbox |
| ApolloShop.Persistence | EF Core, configurations, migrations, seeding |
| ApolloShop.Api | HTTP, auth middleware, ProblemDetails, Swagger |

## Authentication

- Password hashing: BCrypt
- Access token: JWT (short-lived), sent as `Authorization: Bearer`
- Refresh token: stored in DB, rotated, delivered via httpOnly Secure cookie `refresh_token`
- Roles: `Customer`, `Admin`
- Permissions: claim-based; Admin policies require specific permissions for future expansion

## Payments

Gateway abstraction with Mock/Sandbox implementation for Development so checkout completes without a real merchant id.

## Caching

Memory/distributed cache only for category tree, public product-by-slug, and admin dashboard aggregates (short TTL).

## Testing

- Unit/domain tests in `tests/ApolloShop.Domain.Tests`
- FluentValidation + handler tests in `tests/ApolloShop.Application.Tests`
- HTTP integration tests via `WebApplicationFactory<Program>` with EF InMemory override (`tests/ApolloShop.IntegrationTests`)
- Seeder uses `MigrateAsync` for relational providers and `EnsureCreatedAsync` for InMemory

## Docker

`apollo.shop.api/docker-compose.yml` runs SQL Server 2022, the API, and the Next.js UI. See API README for `docker compose up --build`.

## Frontend

- Route groups: storefront, account, admin
- Server Components + dynamic metadata for Home, Product, Category, Blog
- TanStack Query for authenticated client state
- Theme: Light / Dark / System (persisted)

## Out of scope references

This codebase does **not** depend on `e-commerce-v1` or other Apollo monorepo apps.
