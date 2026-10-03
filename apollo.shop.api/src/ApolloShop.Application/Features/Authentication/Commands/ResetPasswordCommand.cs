using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _clock;

    public ResetPasswordCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, IDateTimeProvider clock)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _clock = clock;
    }

    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new NotFoundException("User", email);

        if (string.IsNullOrWhiteSpace(user.PasswordResetToken)
            || user.PasswordResetToken != request.Token
            || user.PasswordResetExpiresAtUtc is null
            || user.PasswordResetExpiresAtUtc <= _clock.UtcNow)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Token", "Invalid or expired reset token.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiresAtUtc = null;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
