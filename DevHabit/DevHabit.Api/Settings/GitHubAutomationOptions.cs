namespace DevHabit.Api.Settings;

public sealed class GitHubAutomationOptions
{
    public const string SectionName = "GitHubAutomation";

    public required int ScanIntervalMinutes { get; init; }
}
