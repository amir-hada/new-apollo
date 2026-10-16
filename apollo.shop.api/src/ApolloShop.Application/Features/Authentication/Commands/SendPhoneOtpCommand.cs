using System.Security.Cryptography;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

    public SendPhoneOtpCommandHandler(
        IApplicationDbContext db,
        IPasswordHasher passwordHasher,
        ISmsSender smsSender,
        IDateTimeProvider clock)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _smsSender = smsSender;
        _clock = clock;
    }

    public async Task<SendOtpResponse> Handle(SendPhoneOtpCommand request, CancellationToken cancellationToken)
    {
        var phone = PhoneNormalization.NormalizeOrThrow(request.PhoneNumber);
        var now = _clock.UtcNow;

        var settings = await _db.ShopSettings.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
        if (settings is not null && !settings.SmsOtpEnabled)
        {
            throw new ValidationException("Sms", "ارسال پیامک OTP در تنظیمات این فروشگاه غیرفعال است.");
        }

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

        try
        {
            await _smsSender.SendOtpAsync(phone, code, cancellationToken);
        }
        catch
        {
            var failed = await _db.PhoneOtps
                .Where(o => o.PhoneNumber == phone && o.Purpose == "login" && o.ConsumedAtUtc == null)
                .OrderByDescending(o => o.CreatedAtUtc)
                .FirstOrDefaultAsync(cancellationToken);
            if (failed is not null)
            {
                failed.ConsumedAtUtc = _clock.UtcNow;
                await _db.SaveChangesAsync(cancellationToken);
            }

            throw;
        }

        return new SendOtpResponse(phone, OtpTtlSeconds, DevCode: null);
    }
}
