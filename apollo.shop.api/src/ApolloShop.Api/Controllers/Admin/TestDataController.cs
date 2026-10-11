using ApolloShop.Application.Features.TestData;
using ApolloShop.Application.Features.TestData.Commands;
using ApolloShop.Application.Features.TestData.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/test-data")]
public class TestDataController : ControllerBase
{
    private readonly IMediator _mediator;

    public TestDataController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<TestDataStatusDto>> GetStatus(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetTestDataTopicsQuery(), cancellationToken));

    [HttpPost("generate")]
    public async Task<ActionResult<TestDataGenerateResult>> Generate(
        [FromBody] GenerateTestDataRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GenerateTestDataCommand(request.TopicKey), cancellationToken));

    [HttpDelete]
    public async Task<ActionResult<TestDataClearResult>> Clear(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new ClearTestDataCommand(), cancellationToken));
}

public sealed record GenerateTestDataRequest(string TopicKey);
