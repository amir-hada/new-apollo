using ApolloShop.Application.Features.ShopSettings.Commands;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/shop-settings")]
public class ShopSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShopSettingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<ShopSettingsDto>> Get(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetShopSettingsQuery(), cancellationToken));

    [HttpPut]
    public async Task<ActionResult<ShopSettingsDto>> Update(
        [FromBody] UpdateShopSettingsRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateShopSettingsCommand(request), cancellationToken));

    [HttpPut("hero-banners")]
    public async Task<ActionResult<ShopSettingsDto>> UpdateHeroBanners(
        [FromBody] UpdateHeroBannersRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateHeroBannersCommand(request), cancellationToken));

    [HttpPut("home-stories")]
    public async Task<ActionResult<ShopSettingsDto>> UpdateHomeStories(
        [FromBody] UpdateHomeStoriesRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateHomeStoriesCommand(request), cancellationToken));

    [HttpPut("sms")]
    public async Task<ActionResult<ShopSettingsDto>> UpdateSms(
        [FromBody] UpdateShopSmsSettingsRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateShopSmsSettingsCommand(request), cancellationToken));

    [HttpPut("logistics")]
    public async Task<ActionResult<ShopSettingsDto>> UpdateLogistics(
        [FromBody] UpdateShopLogisticsSettingsRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateShopLogisticsSettingsCommand(request), cancellationToken));
}
