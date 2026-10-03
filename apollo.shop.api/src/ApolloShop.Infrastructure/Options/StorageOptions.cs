namespace ApolloShop.Infrastructure.Options;

public class StorageOptions
{
    public const string SectionName = "Storage";

    public string RootPath { get; set; } = "wwwroot/media";
    public string PublicBasePath { get; set; } = "/media";
}
