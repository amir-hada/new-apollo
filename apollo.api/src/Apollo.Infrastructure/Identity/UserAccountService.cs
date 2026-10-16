using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Abstractions.Notifications;
using Apollo.Application.Abstractions.Sms;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Apollo.Infrastructure.Identity;

public sealed class UserAccountService : IUserAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly ITokenService _tokenService;
    private readonly IWebHostEnvironment _environment;
    private readonly IFileAccessService _fileAccessService;
    private readonly INotificationService _notificationService;
    private readonly ISmsSender _smsSender;
    private readonly ILogger<UserAccountService> _logger;

    public UserAccountService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext dbContext,
        ITokenService tokenService,
        IWebHostEnvironment environment,
        IFileAccessService fileAccessService,
        INotificationService notificationService,
        ISmsSender smsSender,
        ILogger<UserAccountService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
        _tokenService = tokenService;
        _environment = environment;
        _fileAccessService = fileAccessService;
        _notificationService = notificationService;
        _smsSender = smsSender;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterWithEmailAsync(
        string email,
        string username,
        string password,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var normalizedUsername = username.Trim().ToLowerInvariant();

        await EnsureEmailAndUsernameAvailableAsync(normalizedEmail, normalizedUsername, cancellationToken);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = normalizedUsername,
            Email = normalizedEmail,
            FirstName = normalizedUsername,
            LastName = string.Empty,
            CreatedAtUtc = DateTime.UtcNow,
            EmailConfirmed = true,
        };

        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["password"] = createResult.Errors.Select(error => error.Description).ToArray(),
            });
        }

        await _userManager.AddToRoleAsync(user, AppRoles.User);
        await SendProfileCompleteReminderAsync(user.Id, cancellationToken);

        return await _tokenService.CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginWithEmailAsync(
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(normalizedEmail);

        if (user is null)
        {
            throw new UnauthorizedException("ایمیل یا رمز عبور اشتباه است.");
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(
            user,
            password,
            lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            throw new UnauthorizedException("ایمیل یا رمز عبور اشتباه است.");
        }

        EnsureUserCanSignIn(user);

        return await _tokenService.CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginWithUsernameAsync(
        string username,
        string password,
        CancellationToken cancellationToken)
    {
        var normalizedUsername = username.Trim().ToLowerInvariant();
        var user = await _userManager.FindByNameAsync(normalizedUsername);

        if (user is null)
        {
            throw new UnauthorizedException("نام کاربری یا رمز عبور اشتباه است.");
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(
            user,
            password,
            lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            throw new UnauthorizedException("نام کاربری یا رمز عبور اشتباه است.");
        }

        EnsureUserCanSignIn(user);

        return await _tokenService.CreateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<SendOtpResponse> SendOtpAsync(
        string mobileNumber,
        CancellationToken cancellationToken)
    {
        var normalizedMobile = mobileNumber.Trim();

        var existingUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.PhoneNumber == normalizedMobile, cancellationToken);

        if (existingUser is not null)
        {
            EnsureUserCanSignIn(existingUser);
        }

        var activeOtps = await _dbContext.PhoneOtps
            .Where(otp =>
                otp.MobileNumber == normalizedMobile &&
                otp.Purpose == ValidationRules.OtpPurposeAuth &&
                !otp.IsUsed &&
                otp.ExpiresAtUtc > DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        foreach (var activeOtp in activeOtps)
        {
            activeOtp.IsUsed = true;
        }

        var code = Random.Shared.Next(10000, 99999).ToString();
        var otp = new PhoneOtp
        {
            Id = Guid.NewGuid(),
            MobileNumber = normalizedMobile,
            Code = code,
            Purpose = ValidationRules.OtpPurposeAuth,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(2),
        };

        _dbContext.PhoneOtps.Add(otp);
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await _smsSender.SendOtpAsync(normalizedMobile, code, cancellationToken);
            _logger.LogInformation("OTP sent to {MobileNumber}", normalizedMobile);
        }
        catch (ValidationException) when (_environment.IsDevelopment())
        {
            // Allow local auth testing before SMS.ir credentials are configured.
            _logger.LogWarning(
                "SMS panel is not ready; OTP for {MobileNumber} is {Code}",
                normalizedMobile,
                code);
        }

        return new SendOtpResponse("کد تأیید ارسال شد.", DebugCode: null);
    }

    public async Task<AuthResponse> VerifyPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken)
    {
        var normalizedMobile = mobileNumber.Trim();
        await ValidateOtpAsync(normalizedMobile, code, cancellationToken);

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(existingUser => existingUser.PhoneNumber == normalizedMobile, cancellationToken);

        if (user is not null)
        {
            EnsureUserCanSignIn(user);
            return await _tokenService.CreateAuthResponseAsync(user, cancellationToken);
        }

        return await CreatePhoneUserAsync(normalizedMobile, cancellationToken);
    }

    public async Task<AuthResponse> LoginWithPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken) =>
        await VerifyPhoneAsync(mobileNumber, code, cancellationToken);

    public async Task<AuthResponse> RegisterWithPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken) =>
        await VerifyPhoneAsync(mobileNumber, code, cancellationToken);

    public Task<ForgotPasswordResponse> ForgotPasswordAsync(
        string email,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset requested for {Email}", email.Trim().ToLowerInvariant());

        return Task.FromResult(new ForgotPasswordResponse(
            "اگر ایمیل در سیستم موجود باشد، لینک بازیابی رمز عبور ارسال می‌شود."));
    }

    public async Task<UserProfileDto> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("کاربر یافت نشد.");
        }

        EnsureUserCanSignIn(user);

        return await MapProfileAsync(user, cancellationToken);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(
        Guid userId,
        string? firstName,
        string? lastName,
        string? email,
        string? nationalId,
        string? mobileNumber,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("کاربر یافت نشد.");
        }

        user.FirstName = firstName?.Trim() ?? string.Empty;
        user.LastName = lastName?.Trim() ?? string.Empty;
        user.NationalId = string.IsNullOrWhiteSpace(nationalId) ? null : nationalId.Trim();

        var normalizedEmail = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
        if (!string.Equals(user.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
        {
            if (!string.IsNullOrWhiteSpace(normalizedEmail) &&
                await _userManager.FindByEmailAsync(normalizedEmail) is { } existingUser &&
                existingUser.Id != user.Id)
            {
                throw new ConflictException("این ایمیل قبلاً ثبت شده است.");
            }

            user.Email = normalizedEmail;
            user.EmailConfirmed = !string.IsNullOrWhiteSpace(normalizedEmail);
        }

        if (mobileNumber is not null)
        {
            var normalizedMobile = string.IsNullOrWhiteSpace(mobileNumber)
                ? null
                : mobileNumber.Trim();

            if (!string.Equals(user.PhoneNumber, normalizedMobile, StringComparison.Ordinal))
            {
                if (!string.IsNullOrWhiteSpace(normalizedMobile))
                {
                    var mobileTaken = await _dbContext.Users.AnyAsync(
                        existingUser =>
                            existingUser.Id != user.Id &&
                            existingUser.PhoneNumber == normalizedMobile,
                        cancellationToken);

                    if (mobileTaken)
                    {
                        throw new ConflictException("این شماره موبایل قبلاً ثبت شده است.");
                    }
                }

                user.PhoneNumber = normalizedMobile;
                user.PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(normalizedMobile);
            }
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["profile"] = updateResult.Errors.Select(error => error.Description).ToArray(),
            });
        }

        return await MapProfileAsync(user, cancellationToken);
    }

    public async Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync(
        CancellationToken cancellationToken)
    {
        var users = await _dbContext.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var result = new List<AdminUserListItemDto>(users.Count);

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new AdminUserListItemDto(
                user.Id,
                user.UserName!,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber,
                user.NationalId,
                await _fileAccessService.ResolveAccessUrlAsync(
                    user.ProfilePictureUrl,
                    cancellationToken),
                roles.ToList(),
                user.IsActive,
                user.CreatedAtUtc));
        }

        return result;
    }

    private static void EnsureUserCanSignIn(ApplicationUser user)
    {
        if (!user.IsActive)
        {
            throw new ForbiddenException(UserAccessMessages.AccountDeactivated);
        }
    }

    private async Task ValidateOtpAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken)
    {
        var normalizedCode = code.Trim();

        // Dev-only bypass when SMS panel is not yet configured.
        if (_environment.IsDevelopment() &&
            string.Equals(normalizedCode, ValidationRules.MasterOtpCode, StringComparison.Ordinal))
        {
            var smsEnabled = await _dbContext.PlatformSmsSettings
                .AsNoTracking()
                .AnyAsync(s => s.IsEnabled && s.ApiKey != "", cancellationToken);
            if (!smsEnabled)
            {
                return;
            }
        }

        var otp = await _dbContext.PhoneOtps
            .Where(item =>
                item.MobileNumber == mobileNumber &&
                item.Purpose == ValidationRules.OtpPurposeAuth &&
                !item.IsUsed)
            .OrderByDescending(item => item.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (otp is null || otp.IsExpired)
        {
            throw new UnauthorizedException("کد تأیید نامعتبر یا منقضی شده است.");
        }

        if (!string.Equals(otp.Code, normalizedCode, StringComparison.Ordinal))
        {
            throw new UnauthorizedException("کد تأیید اشتباه است.");
        }

        otp.IsUsed = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthResponse> CreatePhoneUserAsync(
        string normalizedMobile,
        CancellationToken cancellationToken)
    {
        if (await _userManager.FindByNameAsync(normalizedMobile) is not null)
        {
            throw new ConflictException("این شماره موبایل قبلاً ثبت شده است.");
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = normalizedMobile,
            PhoneNumber = normalizedMobile,
            FirstName = string.Empty,
            LastName = string.Empty,
            CreatedAtUtc = DateTime.UtcNow,
            PhoneNumberConfirmed = true,
        };

        var password = $"Ap{Guid.NewGuid():N}1";
        var createResult = await _userManager.CreateAsync(user, password);

        if (!createResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["mobileNumber"] = createResult.Errors
                    .Select(error => MapIdentityError(error.Description))
                    .ToArray(),
            });
        }

        await _userManager.AddToRoleAsync(user, AppRoles.User);
        await SendProfileCompleteReminderAsync(user.Id, cancellationToken);

        return await _tokenService.CreateAuthResponseAsync(user, cancellationToken);
    }

    private async Task SendProfileCompleteReminderAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        await _notificationService.SendAsync(
            userId,
            NotificationTypes.ProfileCompleteReminder,
            NotificationMessages.ProfileCompleteReminder,
            cancellationToken);
    }

    private async Task EnsureEmailAndUsernameAvailableAsync(
        string email,
        string username,
        CancellationToken cancellationToken)
    {
        if (await _userManager.FindByEmailAsync(email) is not null)
        {
            throw new ConflictException("این ایمیل قبلاً ثبت شده است.");
        }

        if (await _userManager.FindByNameAsync(username) is not null)
        {
            throw new ConflictException("این نام کاربری قبلاً ثبت شده است.");
        }
    }

    private static string MapIdentityError(string message) =>
        message switch
        {
            "Email '' is invalid." => "خطا در ساخت حساب کاربری. لطفاً دوباره تلاش کنید.",
            _ => message,
        };

    private async Task<UserProfileDto> MapProfileAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new(
            user.Id,
            user.UserName!,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.NationalId,
            await _fileAccessService.ResolveAccessUrlAsync(
                user.ProfilePictureUrl,
                cancellationToken),
            roles.ToList());
    }
}
