namespace DevHabit.Api.DTOs.Entries;

public sealed record EntryStatsDto
{
    public required List<DailyStatsDto> DailyStats { get; init; }
    public required int TotalEntries { get; init; }
    public required int CurrentStreak { get; init; }
    public required int LongestStreak { get; init; }
}
