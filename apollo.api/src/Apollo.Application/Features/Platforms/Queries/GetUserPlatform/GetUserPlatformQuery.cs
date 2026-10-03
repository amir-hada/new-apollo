using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Queries.GetUserPlatform;

public sealed record GetUserPlatformQuery(
    Guid UserId,
    Guid PlatformId) : IRequest<UserPlatformDetailDto>;

public sealed class GetUserPlatformQueryValidator : AbstractValidator<GetUserPlatformQuery>
{
    public GetUserPlatformQueryValidator()
    {
        RuleFor(query => query.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(query => query.PlatformId)
            .NotEmpty().WithMessage("شناسه پلتفرم الزامی است.");
    }
}

public sealed class GetUserPlatformQueryHandler
    : IRequestHandler<GetUserPlatformQuery, UserPlatformDetailDto>
{
    private readonly IUserPlatformService _userPlatformService;

    public GetUserPlatformQueryHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<UserPlatformDetailDto> Handle(
        GetUserPlatformQuery request,
        CancellationToken cancellationToken) =>
        _userPlatformService.GetUserPlatformAsync(
            request.UserId,
            request.PlatformId,
            cancellationToken);
}
