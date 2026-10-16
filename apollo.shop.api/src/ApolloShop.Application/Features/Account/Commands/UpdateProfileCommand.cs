using System.Text.RegularExpressions;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Account.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Account.Commands;

public record UpdateProfileCommand(UpdateProfileRequest Request) : IRequest<ProfileDto>;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ProfileDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public UpdateProfileCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        var firstName = request.Request.FirstName?.Trim() ?? string.Empty;
        var lastName = request.Request.LastName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ValidationException("FirstName", "نام را وارد کنید.");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ValidationException("LastName", "نام خانوادگی را وارد کنید.");
        }

        var phone = NormalizePhone(request.Request.PhoneNumber);
        if (phone is not null)
        {
            var taken = await _db.Users.AnyAsync(
                u => u.Id != userId && u.PhoneNumber == phone,
                cancellationToken);
            if (taken)
            {
                throw new ConflictException("این شماره موبایل قبلاً برای حساب دیگری ثبت شده است.");
            }
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.PhoneNumber = phone;

        // null = leave unchanged; empty string = clear; otherwise set.
        if (request.Request.AvatarUrl is not null)
        {
            user.AvatarUrl = string.IsNullOrWhiteSpace(request.Request.AvatarUrl)
                ? null
                : request.Request.AvatarUrl.Trim();
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new ProfileDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.AvatarUrl,
            user.UserRoles.Select(ur => ur.Role.Name).ToList());
    }

    private static string? NormalizePhone(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var digits = Regex.Replace(raw, @"[^\d]", "");
        if (digits.StartsWith("98") && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        if (digits.Length == 10 && digits.StartsWith("9"))
        {
            digits = "0" + digits;
        }

        if (digits.Length > 0 && digits.Length != 11)
        {
            throw new ValidationException("PhoneNumber", "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
        }

        if (digits.Length == 11 && !digits.StartsWith("09"))
        {
            throw new ValidationException("PhoneNumber", "شماره موبایل باید با ۰۹ شروع شود.");
        }

        return digits.Length == 0 ? null : digits;
    }
}
