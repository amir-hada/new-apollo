using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace ApolloShop.IntegrationTests;

public class ApiIntegrationTests : IClassFixture<ApolloShopWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(ApolloShopWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Swagger_json_loads()
    {
        var response = await _client.GetAsync("/swagger/v1/swagger.json");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("ApolloShop API");
    }

    [Fact]
    public async Task Get_products_returns_ok()
    {
        var response = await _client.GetAsync("/api/products");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Admin_products_without_token_returns_unauthorized()
    {
        var response = await _client.GetAsync("/api/admin/products");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_with_seeded_admin_succeeds()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@apolloshop.ir",
            password = "Admin@12345"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<LoginResponse>();
        payload.Should().NotBeNull();
        payload!.AccessToken.Should().NotBeNullOrWhiteSpace();
        payload.User.Email.Should().Be("admin@apolloshop.ir");
        payload.User.Roles.Should().Contain("Admin");
    }

    [Fact]
    public async Task Otp_send_does_not_expose_code_in_response()
    {
        var phone = "0912" + Random.Shared.Next(1000000, 9999999).ToString();

        var send = await _client.PostAsJsonAsync("/api/auth/otp/send", new { phoneNumber = phone });
        send.StatusCode.Should().Be(HttpStatusCode.OK);

        var otpPayload = await send.Content.ReadFromJsonAsync<SendOtpResponseDto>();
        otpPayload.Should().NotBeNull();
        otpPayload!.DevCode.Should().BeNull();
        otpPayload.ExpiresInSeconds.Should().Be(120);
        otpPayload.PhoneNumber.Should().Be(phone);
    }

    private sealed record SendOtpResponseDto(
        string PhoneNumber,
        int ExpiresInSeconds,
        string? DevCode);

    private sealed record LoginResponse(
        string AccessToken,
        DateTime ExpiresAt,
        string RefreshToken,
        UserInfo User);

    private sealed record UserInfo(
        Guid Id,
        string Email,
        string FirstName,
        string LastName,
        string? PhoneNumber,
        IReadOnlyList<string> Roles);
}
