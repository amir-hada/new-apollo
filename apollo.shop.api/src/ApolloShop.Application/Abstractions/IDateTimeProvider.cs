namespace ApolloShop.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
