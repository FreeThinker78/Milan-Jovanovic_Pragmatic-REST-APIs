using DevHabit.Api.DTOs.Common;

namespace DevHabit.Api.DTOs.Habits;

public sealed record HabitQueryParameters : AcceptHeaderDto
{
    public string? Fields { get; init; }
}
