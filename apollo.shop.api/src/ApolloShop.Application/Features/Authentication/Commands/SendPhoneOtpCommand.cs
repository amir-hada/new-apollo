using System.Security.Cryptography;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Entities.Identity;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record SendPhoneOtpCommand(string PhoneNumber) : IRequest<SendOtpResponse>;

public class SendPhoneOtpCommandHandler : IRequestHandler<SendPhoneOtpCommand, SendOtpResponse>
{
    public const int OtpTtlSeconds = 120;
    public const int OtpLength = 5;

    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ISmsSender _smsSender;
    private readonly IDateTimeProvider _clock;
    private readonly IHostEnvironment _environment;

    public SendPhoneOtpCommandHandler(
        IApplicationDbContext db,
        IPasswordHasher passwordHasher,
        ISmsSender smsSender,
        IDateTimeProvider clock,
        IHostEnvironment environment)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _smsSender = smsSender;
        _clock = clock;
        _environment = environment;
    }

    public async Task<SendOtpResponse> Handle(SendPhoneOtpCommand request, CancellationToken cancellationToken)
    {
        var phone = PhoneNormalization.NormalizeOrThrow(request.PhoneNumber);
        var now = _clock.UtcNow;

        var previous = await _db.PhoneOtps
            .Where(o => o.PhoneNumber == phone && o.Purpose == "login" && o.ConsumedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var otp in previous)
        {
            otp.ConsumedAtUtc = now;
        }

        var code = RandomNumberGenerator.GetInt32(0, (int)Math.Pow(10, OtpLength))
            .ToString($"D{OtpLength}");

        _db.PhoneOtps.Add(new PhoneOtp
        {
            Id = Guid.NewGuid(),
            PhoneNumber = phone,
            Code = _passwordHasher.Hash(code),
            ExpiresAtUtc = now.AddSeconds(OtpTtlSeconds),
            CreatedAtUtc = now,
            Purpose = "login"
        });

        await _db.SaveChangesAsync(cancellationToken);

        await _smsSender.SendAsync(phone, $"کد ورود آپولوشاپ: {code}", cancellationToken);

        var devCode = _environment.IsDevelopment() ? code : null;
        return new SendOtpResponse(phone, OtpTtlSeconds, devCode);
    }
}
