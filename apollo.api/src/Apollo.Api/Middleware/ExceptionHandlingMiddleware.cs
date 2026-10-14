using System.Net;
using Apollo.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                "خطای اعتبارسنجی",
                (object?)validationException.Errors),
            UnauthorizedException => (
                HttpStatusCode.Unauthorized,
                "عدم دسترسی",
                null),
            NotFoundException => (
                HttpStatusCode.NotFound,
                "یافت نشد",
                null),
            ConflictException => (
                HttpStatusCode.Conflict,
                "تداخل اطلاعات",
                null),
            ForbiddenException => (
                HttpStatusCode.Forbidden,
                "عدم دسترسی",
                null),
            ShopProvisioningException => (
                HttpStatusCode.BadGateway,
                "خطا در ارتباط با سرویس فروشگاه",
                null),
            _ => (
                HttpStatusCode.InternalServerError,
                "خطای سرور",
                null),
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception occurred.");
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Detail = exception.Message,
            Status = (int)statusCode,
            Instance = context.Request.Path,
        };

        if (errors is not null)
        {
            problemDetails.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
