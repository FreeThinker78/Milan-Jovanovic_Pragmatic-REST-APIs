using DevHabit.Api.Entities;

namespace DevHabit.Api.DTOs.Habits;

public class HabitsQueryParameters
{
    public string? Search { get; set; }
    public HabitType? Type { get; set; }
    public HabitStatus? Status { get; set; }
    public string? Sort { get; init; }
}
