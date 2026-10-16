namespace ApolloShop.Infrastructure.Options;

public class ApolloPlatformOptions
{
    public const string SectionName = "ApolloPlatform";

    /// <summary>Base URL of apollo.api (e.g. http://localhost:5157).</summary>
    public string BaseUrl { get; set; } = "http://localhost:5157";

    /// <summary>Must match apollo.api Shop:ProvisioningKey.</summary>
    public string ProvisioningKey { get; set; } = string.Empty;
}
