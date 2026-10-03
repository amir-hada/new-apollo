using ApolloShop.Application.Features.Payments.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator) => _mediator = mediator;

    public record StartPaymentBody(Guid OrderId, string CallbackUrl);
    public record VerifyPaymentBody(string Authority);

    [Authorize]
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartPaymentBody body, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new StartPaymentCommand(body.OrderId, body.CallbackUrl), cancellationToken));

    [HttpPost("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify([FromBody] VerifyPaymentBody body, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new VerifyPaymentCommand(body.Authority), cancellationToken));
}
