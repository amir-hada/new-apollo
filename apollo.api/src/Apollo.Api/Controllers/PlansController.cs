using Apollo.Application.Features.Plans.Queries.GetPublicPlans;
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
    public async Task<IActionResult> GetPlans(CancellationToken cancellationToken)
    {
        var plans = await _sender.Send(new GetPublicPlansQuery(), cancellationToken);
        return Ok(plans);
    }
}
