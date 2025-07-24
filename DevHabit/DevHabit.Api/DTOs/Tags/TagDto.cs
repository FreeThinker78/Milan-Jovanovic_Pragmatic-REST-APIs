using DevHabit.Api.DTOs.Common;
using Newtonsoft.Json;

namespace DevHabit.Api.DTOs.Tags;

public sealed record TagDto : ILinksResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
    public DateTime? UpdatedAtUtc { get; init; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public List<LinkDto> Links { get; set; }
}
