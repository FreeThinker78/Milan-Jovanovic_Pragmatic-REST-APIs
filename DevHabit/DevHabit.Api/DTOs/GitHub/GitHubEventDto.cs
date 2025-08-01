using Newtonsoft.Json;

namespace DevHabit.Api.DTOs.GitHub;

public sealed record GitHubEventDto(
    [property: JsonProperty("id")] string Id,
    [property: JsonProperty("type")] string Type,
    [property: JsonProperty("actor")] GitHubActorDto Actor,
    [property: JsonProperty("repo")] GitHubRepositoryDto Repository,
    [property: JsonProperty("payload")] GitHubPayloadDto Payload,
    [property: JsonProperty("public")] bool IsPublic,
    [property: JsonProperty("created_at")] DateTime CreatedAt
);

public sealed record GitHubActorDto(
    [property: JsonProperty("id")] int Id,
    [property: JsonProperty("login")] string Login,
    [property: JsonProperty("display_login")] string DisplayLogin,
    [property: JsonProperty("avatar_url")] string AvatarUrl
);

public sealed record GitHubRepositoryDto(
    [property: JsonProperty("id")] int Id,
    [property: JsonProperty("name")] string Name,
    [property: JsonProperty("url")] string Url
);

public sealed record GitHubPayloadDto(
    [property: JsonProperty("action")] string? Action,
    [property: JsonProperty("ref")] string? Ref,
    [property: JsonProperty("commits")] IReadOnlyList<GitHubCommitDto>? Commits
);

public sealed record GitHubCommitDto(
    [property: JsonProperty("sha")] string Sha,
    [property: JsonProperty("message")] string Message,
    [property: JsonProperty("url")] string Url
);
