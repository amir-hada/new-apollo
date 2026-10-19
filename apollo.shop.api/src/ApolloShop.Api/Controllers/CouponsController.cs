using ApolloShop.Application.Features.Coupons.DTOs;
using ApolloShop.Application.Features.Coupons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new ValidateCouponQuery(request.Code, request.Subtotal), cancellationToken));
}
