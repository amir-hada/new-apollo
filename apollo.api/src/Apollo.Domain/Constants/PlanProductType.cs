using System.Text.Json.Serialization;

namespace Apollo.Domain.Constants;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PlanProductType
{
    Shop = 1,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SiteProvisioningStatus
{
    Pending = 0,
    Ready = 1,
    Failed = 2,
}
