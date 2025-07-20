using DevHabit.Api.Entities;

namespace DevHabit.Api.DTOs.Habits;

public class HabitsQueryParameters
{
    public string? Search { get; set; }
    public HabitType? Type { get; set; }
    public HabitStatus? Status { get; set; }
    public string? Sort { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
