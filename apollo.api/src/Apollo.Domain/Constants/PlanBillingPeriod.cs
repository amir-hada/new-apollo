namespace Apollo.Domain.Constants;

public static class PlanBillingPeriod
{
    public const string Monthly = "Monthly";
    public const string Yearly = "Yearly";

    public static readonly string[] All = [Monthly, Yearly];
}
