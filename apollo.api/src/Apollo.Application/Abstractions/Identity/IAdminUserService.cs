namespace Apollo.Application.Abstractions.Identity;

public interface IAdminUserService
{
    Task SetUserActiveStatusAsync(
        Guid userId,
        bool isActive,
        Guid requestedByUserId,
        CancellationToken cancellationToken);

    Task DeleteUserAsync(
        Guid userId,
        Guid requestedByUserId,
        CancellationToken cancellationToken);
}
