using ApolloShop.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record ForgotPasswordCommand(string Email) : IRequest<string?>;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, string?>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public ForgotPasswordCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<string?> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = token;
        user.PasswordResetExpiresAtUtc = _clock.UtcNow.AddHours(2);
        await _db.SaveChangesAsync(cancellationToken);

        // In production this would be emailed. Returned for sandbox/dev convenience.
        return token;
    }
}
