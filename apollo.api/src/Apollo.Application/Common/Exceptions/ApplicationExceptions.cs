namespace Apollo.Application.Common.Exceptions;

public abstract class ApplicationException : Exception
{
    protected ApplicationException(string message)
        : base(message)
    {
    }
}

public sealed class ValidationException : ApplicationException
{
    public ValidationException(IDictionary<string, string[]> errors)
        : base("یک یا چند خطای اعتبارسنجی رخ داده است.")
    {
        Errors = errors;
    }

    public IDictionary<string, string[]> Errors { get; }
}

public sealed class NotFoundException : ApplicationException
{
    public NotFoundException(string message)
        : base(message)
    {
    }
}

public sealed class UnauthorizedException : ApplicationException
{
    public UnauthorizedException(string message)
        : base(message)
    {
    }
}

public sealed class ConflictException : ApplicationException
{
    public ConflictException(string message)
        : base(message)
    {
    }
}

public sealed class ShopProvisioningException : ApplicationException
{
    public ShopProvisioningException(string message)
        : base(message)
    {
    }
}

public sealed class ForbiddenException : ApplicationException
{
    public ForbiddenException(string message)
        : base(message)
    {
    }
}
