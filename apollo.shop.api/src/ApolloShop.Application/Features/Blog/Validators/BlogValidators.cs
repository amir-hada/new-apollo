using ApolloShop.Application.Features.Blog.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Blog.Validators;

public class CreateBlogPostCommandValidator : AbstractValidator<CreateBlogPostCommand>
{
    public CreateBlogPostCommandValidator()
    {
        RuleFor(x => x.Request.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Slug).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Body).NotEmpty();
    }
}

public class UpdateBlogPostCommandValidator : AbstractValidator<UpdateBlogPostCommand>
{
    public UpdateBlogPostCommandValidator()
    {
        RuleFor(x => x.Request.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Slug).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Body).NotEmpty();
    }
}
