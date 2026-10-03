using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.Commands;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using ApolloShop.Persistence;
using ApolloShop.Persistence.Interceptors;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace ApolloShop.Application.Tests;

public class CreateProductCommandHandlerTests
{
    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options, new AuditableEntityInterceptor());
    }

    private static CreateProductRequest Request(
        string name = "Apollo Phone X",
        string slug = "apollo-phone-x",
        ProductStatus status = ProductStatus.Published) =>
        new(
            name,
            slug,
            "Flagship phone",
            null,
            null,
            true,
            status,
            25_000_000,
            null,
            10,
            true,
            false,
            null,
            1,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            null,
            null,
            null,
            null,
            null,
            null);

    [Fact]
    public async Task Handle_creates_product_when_slug_is_unique()
    {
        await using var db = CreateDb();
        var clock = new Mock<IDateTimeProvider>();
        var now = new DateTime(2026, 9, 9, 12, 0, 0, DateTimeKind.Utc);
        clock.Setup(c => c.UtcNow).Returns(now);

        var handler = new CreateProductCommandHandler(db, clock.Object);
        var result = await handler.Handle(new CreateProductCommand(Request()), CancellationToken.None);

        result.Name.Should().Be("Apollo Phone X");
        result.Slug.Should().Be("apollo-phone-x");
        result.BasePrice.Should().Be(25_000_000);
        result.Status.Should().Be(ProductStatus.Draft);
        result.IsAvailable.Should().BeFalse();
        result.ProductCode.Should().Be("0001");
        result.Sku.Should().BeNull();

        (await db.Products.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Handle_throws_conflict_when_slug_exists()
    {
        await using var db = CreateDb();
        var clock = new Mock<IDateTimeProvider>();
        clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var handler = new CreateProductCommandHandler(db, clock.Object);
        var request = Request(name: "Phone", slug: "dup-slug", status: ProductStatus.Draft);

        await handler.Handle(new CreateProductCommand(request), CancellationToken.None);

        var act = async () => await handler.Handle(new CreateProductCommand(request with { Name = "Other" }), CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Product slug already exists.");
    }
}
