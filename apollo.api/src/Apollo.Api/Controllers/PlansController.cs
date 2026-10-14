using Apollo.Application.Features.Plans.Queries.GetPublicPlans;
using Apollo.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/plans")]
public sealed class PlansController : ControllerBase
{
    private readonly ISender _sender;

    public PlansController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans(
        [FromQuery] PlanProductType? productType,
        CancellationToken cancellationToken)
    {
        var plans = await _sender.Send(new GetPublicPlansQuery(productType), cancellationToken);
        return Ok(plans);
    }
}
