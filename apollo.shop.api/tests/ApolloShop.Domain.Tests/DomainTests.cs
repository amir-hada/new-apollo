using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using FluentAssertions;

namespace ApolloShop.Domain.Tests;

public class EnumSanityTests
{
    [Fact]
    public void ProductStatus_values_match_expected()
    {
        ((int)ProductStatus.Draft).Should().Be(0);
        ((int)ProductStatus.Published).Should().Be(1);
        ((int)ProductStatus.Archived).Should().Be(2);
        Enum.GetValues<ProductStatus>().Should().HaveCount(3);
    }

    [Fact]
    public void OrderStatus_values_match_expected()
    {
        ((int)OrderStatus.Pending).Should().Be(0);
        ((int)OrderStatus.Paid).Should().Be(1);
        ((int)OrderStatus.Processing).Should().Be(2);
        ((int)OrderStatus.Shipped).Should().Be(3);
        ((int)OrderStatus.Delivered).Should().Be(4);
        ((int)OrderStatus.Cancelled).Should().Be(5);
        ((int)OrderStatus.Returned).Should().Be(6);
        Enum.GetValues<OrderStatus>().Should().HaveCount(7);
    }
}

public class DomainExceptionTests
{
    [Fact]
    public void NotFoundException_with_key_formats_message()
    {
        var ex = new NotFoundException("Product", Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"));
        ex.Message.Should().Be("Product with key 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' was not found.");
        ex.Should().BeAssignableTo<DomainException>();
    }

    [Fact]
    public void ConflictException_preserves_message()
    {
        var ex = new ConflictException("Email is already registered.");
        ex.Message.Should().Be("Email is already registered.");
        ex.Should().BeAssignableTo<DomainException>();
    }

    [Fact]
    public void ValidationException_with_property_stores_errors()
    {
        var ex = new ValidationException("Email", "Invalid email or password.");
        ex.Errors.Should().ContainKey("Email");
        ex.Errors["Email"].Should().ContainSingle().Which.Should().Be("Invalid email or password.");
    }

    [Fact]
    public void ValidationException_with_dictionary_preserves_errors()
    {
        var errors = new Dictionary<string, string[]>
        {
            ["Password"] = ["Password is required.", "Password must be at least 8 characters."]
        };

        var ex = new ValidationException(errors);
        ex.Errors.Should().BeEquivalentTo(errors);
        ex.Message.Should().Be("One or more validation failures have occurred.");
    }
}

public class OrderMoneyConventionTests
{
    [Theory]
    [InlineData(100_000, 0, 0, 0, 100_000)]
    [InlineData(100_000, 10_000, 5_000, 9_000, 104_000)]
    [InlineData(50_000, 50_000, 0, 0, 0)]
    public void GrandTotal_follows_subtotal_minus_discount_plus_shipping_and_tax(
        decimal subtotal,
        decimal discount,
        decimal shipping,
        decimal tax,
        decimal expected)
    {
        // Order has no calculation methods; totals are set by application handlers using this convention.
        var grandTotal = subtotal - discount + shipping + tax;
        grandTotal.Should().Be(expected);
    }
}
