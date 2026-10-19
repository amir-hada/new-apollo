using ApolloShop.Application.Features.Coupons.Commands;
using ApolloShop.Application.Features.Coupons.DTOs;
using ApolloShop.Application.Features.Coupons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/coupons")]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetCouponsQuery(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertCouponRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateCouponCommand(request), cancellationToken));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertCouponRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateCouponCommand(id, request), cancellationToken));

    [HttpPut("{id:guid}/active")]
    public async Task<IActionResult> SetActive(Guid id, [FromBody] SetCouponActiveBody body, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new SetCouponActiveCommand(id, body.IsActive), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteCouponCommand(id), cancellationToken);
        return NoContent();
    }
}

public record SetCouponActiveBody(bool IsActive);
