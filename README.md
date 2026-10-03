# apolo360

Monorepo containing Apollo apps. The e-commerce stack lives under:

- `apollo.shop.api` — .NET 10 Clean Architecture API
- `apollo.shop.ui` — Next.js storefront + admin UI
- `shop/prompt.md` — product requirements

## ApolloShop with Docker

From the API folder:

```bash
cd apollo.shop.api
docker compose up --build
```

Then open:

- Storefront: http://localhost:3000
- API / Swagger (if enabled): http://localhost:5080
- SQL Server: `localhost:1433` (SA password `ApolloShop_Admin123`)

Seeded admin: `admin@apolloshop.ir` / `Admin@12345`
