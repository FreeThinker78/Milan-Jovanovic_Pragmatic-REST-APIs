namespace DevHabit.Api.DTOs.Entries;

public sealed record CreateEntryBatchDto
{
    public required List<CreateEntryDto> Entries { get; init; }
}
