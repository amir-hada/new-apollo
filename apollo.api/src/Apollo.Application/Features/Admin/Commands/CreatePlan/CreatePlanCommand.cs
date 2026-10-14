using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.CreatePlan;

public sealed record CreatePlanCommand(
    string Name,
    string? ImageFileId,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    string BillingPeriod,
    PlanProductType ProductType = PlanProductType.Shop) : IRequest<AdminPlanListItemDto>;

public sealed class CreatePlanCommandValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty().WithMessage("نام پلن الزامی است.")
            .MaximumLength(200).WithMessage("نام پلن نباید بیشتر از ۲۰۰ کاراکتر باشد.");

        RuleFor(command => command.Description)
            .NotEmpty().WithMessage("توضیحات پلن الزامی است.")
            .MaximumLength(80).WithMessage("توضیحات پلن نباید بیشتر از ۸۰ کاراکتر باشد.");

        RuleFor(command => command.PriceInToman)
            .GreaterThan(0).WithMessage("قیمت باید بیشتر از صفر باشد.");

        RuleFor(command => command.DiscountedPriceInToman)
            .GreaterThan(0).When(command => command.DiscountedPriceInToman.HasValue)
            .WithMessage("قیمت با تخفیف باید بیشتر از صفر باشد.");

        RuleFor(command => command)
            .Must(command =>
                !command.DiscountedPriceInToman.HasValue ||
                command.DiscountedPriceInToman < command.PriceInToman)
            .WithMessage("قیمت با تخفیف باید کمتر از قیمت اصلی باشد.");

        RuleFor(command => command.BillingPeriod)
            .Must(period => PlanBillingPeriod.All.Contains(period, StringComparer.Ordinal))
            .WithMessage("بازه زمانی پلن معتبر نیست.");

        RuleFor(command => command.ProductType)
            .IsInEnum().WithMessage("نوع محصول پلن معتبر نیست.");
    }
}

public sealed class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, AdminPlanListItemDto>
{
    private readonly IAdminPlanService _adminPlanService;

    public CreatePlanCommandHandler(IAdminPlanService adminPlanService)
    {
        _adminPlanService = adminPlanService;
    }

    public Task<AdminPlanListItemDto> Handle(
        CreatePlanCommand request,
        CancellationToken cancellationToken) =>
        _adminPlanService.CreatePlanAsync(
            new CreatePlanRequest(
                request.Name,
                request.ImageFileId,
                request.Description,
                request.PriceInToman,
                request.DiscountedPriceInToman,
                request.IsAvailable,
                request.AllowsInstallment,
                request.BillingPeriod,
                request.ProductType),
            cancellationToken);
}
