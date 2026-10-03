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
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        user.FirstName = request.Request.FirstName.Trim();
        user.LastName = request.Request.LastName.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(request.Request.PhoneNumber)
            ? null
            : request.Request.PhoneNumber.Trim();
        user.AvatarUrl = string.IsNullOrWhiteSpace(request.Request.AvatarUrl)
            ? null
            : request.Request.AvatarUrl.Trim();
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
}
