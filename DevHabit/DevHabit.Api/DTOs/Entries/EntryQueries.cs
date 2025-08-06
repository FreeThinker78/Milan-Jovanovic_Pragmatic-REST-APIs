using System.Linq.Expressions;
using DevHabit.Api.Entities;

namespace DevHabit.Api.DTOs.Entries;

public static class EntryQueries
{
    public static Expression<Func<Entry, EntryDto>> ProjectToDto()
    {
        return entry => new EntryDto
        {
            Id = entry.Id,
            Habit = new EntryHabitDto
            {
                Id = entry.HabitId,
                Name = entry.Habit.Name
            },
            Value = entry.Value,
            Notes = entry.Notes,
            Source = entry.Source,
            ExternalId = entry.ExternalId,
            IsArchived = entry.IsArchived,
            Date = entry.Date,
            CreatedAtUtc = entry.CreatedAtUtc,
            UpdatedAtUtc = entry.UpdatedAtUtc
        };
    }
}
