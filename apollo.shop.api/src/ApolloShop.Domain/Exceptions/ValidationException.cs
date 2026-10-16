namespace ApolloShop.Domain.Exceptions;

public class ValidationException : DomainException
{
    private const string DefaultMessage = "خطای اعتبارسنجی رخ داد.";

    public IDictionary<string, string[]> Errors { get; }

    public ValidationException()
        : base(DefaultMessage)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors)
        : base(FirstErrorMessage(errors) ?? DefaultMessage)
    {
        Errors = errors;
    }

    public ValidationException(string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(string propertyName, string error)
        : base(error)
    {
        Errors = new Dictionary<string, string[]>
        {
            [propertyName] = [error]
        };
    }

    private static string? FirstErrorMessage(IDictionary<string, string[]> errors) =>
        errors.Values.SelectMany(messages => messages).FirstOrDefault(message => !string.IsNullOrWhiteSpace(message));
}
