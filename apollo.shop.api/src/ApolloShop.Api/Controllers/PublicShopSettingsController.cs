using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/shop-settings")]
public class PublicShopSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PublicShopSettingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<ShopSettingsDto>> Get(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetShopSettingsQuery(), cancellationToken));
}
