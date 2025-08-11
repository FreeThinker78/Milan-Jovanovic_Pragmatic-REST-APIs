using DevHabit.Api.DTOs.Common;
using DevHabit.Api.Entities;

namespace DevHabit.Api.DTOs.Entries;

public sealed record EntriesCursorQueryParameters : AcceptHeaderDto
{
    public string? Fields { get; init; }
    public string? HabitId { get; init; }
    public DateOnly? FromDate { get; init; }
    public DateOnly? ToDate { get; init; }
    public EntrySource? Source { get; init; }
    public bool? IsArchived { get; init; }
    
    public string? Cursor { get; init; }
    public int Limit { get; init; } = 10;
}
