using ApolloShop.Application.Abstractions;

namespace ApolloShop.Infrastructure.Time;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
