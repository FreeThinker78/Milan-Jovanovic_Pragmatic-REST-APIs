using DevHabit.Api.DTOs.Common;

namespace DevHabit.Api.DTOs.Entries;

public sealed record EntryQueryParameters : AcceptHeaderDto
{
    public string? Fields { get; init; }
}
