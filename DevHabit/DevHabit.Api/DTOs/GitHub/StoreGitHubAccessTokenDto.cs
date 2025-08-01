namespace DevHabit.Api.DTOs.GitHub;

public sealed record StoreGitHubAccessTokenDto
{
    public required string AccessToken { get; init; }
    public required int ExpiresInDays { get; init; }
}
