# ApolloShop API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ApolloShop.slnx ./
COPY src/ApolloShop.Domain/ApolloShop.Domain.csproj src/ApolloShop.Domain/
COPY src/ApolloShop.Application/ApolloShop.Application.csproj src/ApolloShop.Application/
COPY src/ApolloShop.Infrastructure/ApolloShop.Infrastructure.csproj src/ApolloShop.Infrastructure/
COPY src/ApolloShop.Persistence/ApolloShop.Persistence.csproj src/ApolloShop.Persistence/
COPY src/ApolloShop.Api/ApolloShop.Api.csproj src/ApolloShop.Api/

RUN dotnet restore src/ApolloShop.Api/ApolloShop.Api.csproj

COPY src/ src/
RUN dotnet publish src/ApolloShop.Api/ApolloShop.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApolloShop.Api.dll"]
