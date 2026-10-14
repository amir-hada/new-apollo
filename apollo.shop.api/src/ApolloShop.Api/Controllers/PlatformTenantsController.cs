using ApolloShop.Application.Features.Tenancy.Commands;
using ApolloShop.Application.Features.Tenancy.DTOs;
using ApolloShop.Application.Features.Tenancy.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/platform/tenants")]
public class PlatformTenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlatformTenantsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<ActionResult<IReadOnlyList<TenantDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetTenantsQuery(), cancellationToken));

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin,Admin")]
    public async Task<ActionResult<CreateTenantResultDto>> Create(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateTenantCommand(request), cancellationToken));
}
