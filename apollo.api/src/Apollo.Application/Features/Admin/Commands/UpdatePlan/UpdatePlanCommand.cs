using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.UpdatePlan;

public sealed record UpdatePlanCommand(
    Guid PlanId,
    string Name,
    string? ImageFileId,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    bool IsPublished,
    string BillingPeriod,
    IReadOnlyList<PlanPropertyDto> Properties,
    IReadOnlyList<PlanTemplateDto> Templates) : IRequest<AdminPlanListItemDto>;

public sealed class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(command => command.PlanId)
            .NotEmpty().WithMessage("شناسه پلن الزامی است.");

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

        RuleFor(command => command.Properties)
            .NotNull().WithMessage("ویژگی‌های پلن الزامی است.");

        RuleForEach(command => command.Properties).ChildRules(feature =>
        {
            feature.RuleFor(item => item.Title)
                .NotEmpty().WithMessage("عنوان ویژگی الزامی است.")
                .MaximumLength(200).WithMessage("عنوان ویژگی نباید بیشتر از ۲۰۰ کاراکتر باشد.");

            feature.RuleFor(item => item.Value)
                .NotEmpty().WithMessage("مقدار ویژگی الزامی است.")
                .MaximumLength(500).WithMessage("مقدار ویژگی نباید بیشتر از ۵۰۰ کاراکتر باشد.");
        });

        RuleFor(command => command.Templates)
            .NotNull().WithMessage("قالب‌های پلن الزامی است.");

        RuleForEach(command => command.Templates).ChildRules(template =>
        {
            template.RuleFor(item => item.Title)
                .NotEmpty().WithMessage("عنوان قالب الزامی است.")
                .MaximumLength(200).WithMessage("عنوان قالب نباید بیشتر از ۲۰۰ کاراکتر باشد.");

            template.RuleFor(item => item.Code)
                .NotEmpty().WithMessage("کد قالب الزامی است.")
                .MaximumLength(100).WithMessage("کد قالب نباید بیشتر از ۱۰۰ کاراکتر باشد.");

            template.RuleFor(item => item.ImageFileId)
                .NotEmpty().WithMessage("تصویر قالب الزامی است.")
                .MaximumLength(36).WithMessage("شناسه تصویر قالب معتبر نیست.");
        });
    }
}

public sealed class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, AdminPlanListItemDto>
{
    private readonly IAdminPlanService _adminPlanService;

    public UpdatePlanCommandHandler(IAdminPlanService adminPlanService)
    {
        _adminPlanService = adminPlanService;
    }

    public Task<AdminPlanListItemDto> Handle(
        UpdatePlanCommand request,
        CancellationToken cancellationToken) =>
        _adminPlanService.UpdatePlanAsync(
            request.PlanId,
            new UpdatePlanRequest(
                request.Name,
                request.ImageFileId,
                request.Description,
                request.PriceInToman,
                request.DiscountedPriceInToman,
                request.IsAvailable,
                request.AllowsInstallment,
                request.IsPublished,
                request.BillingPeriod,
                request.Properties,
                request.Templates),
            cancellationToken);
}
