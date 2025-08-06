using DevHabit.Api.Entities;
using FluentValidation;

namespace DevHabit.Api.DTOs.Habits;

public sealed class CreateHabitDtoValidator : AbstractValidator<CreateHabitDto>
{
    private static readonly string[] AllowedUnits =
    [
        "minutes", "hours", "steps", "km", "cal",
        "pages", "books", "tasks", "sessions"
    ];
    private static readonly string[] AllowedUnitsForBinaryHabits = ["sessions", "tasks"];

    public CreateHabitDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(100)
            .WithMessage("Habit name must be between 3 and 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => x.Description is not null)
            .WithMessage("Descriptioncannot exceed 500 characters.");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid habit type.");

        RuleFor(x => x.AutomationSource)
            .IsInEnum()
            .When(x => x.AutomationSource is not null)
            .WithMessage("Invalid automation source.");

        // Frequency validation
        RuleFor(x => x.Frequency.Type)
            .IsInEnum()
            .WithMessage("Invalid frequency unit.");

        RuleFor(x => x.Frequency.TimesPerPeriod)
            .GreaterThan(0)
            .WithMessage("Frequency period must be greater than 0.");

        // Target validation
        RuleFor(x => x.Target.Value)
            .GreaterThan(0)
            .WithMessage("Target value must be greater than 0.");

        RuleFor(x => x.Target.Unit)
            .NotEmpty()
            .Must(unit => AllowedUnits.Contains(unit.ToLowerInvariant()))
            .WithMessage($"Unit must be one of: {string.Join(", ", AllowedUnits)}");

        // EndDate validation
        RuleFor(x => x.EndDate)
            .Must(date => date is null || date.Value > DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("End date must be in the future.");

        // Milestone validation
        When(x => x.Milestone is not null, () =>
        {
            RuleFor(x => x.Milestone!.Target)
            .GreaterThan(0)
            .WithMessage("Milestone target must be greater than 0.");
        });

        //Complex rules
        RuleFor(x => x.Target.Unit)
            .Must((dto, unit) => IsTargetUnitCompatibleWithType(dto.Type, unit))
            .WithMessage("Target unit is not compatible with the habit type.");
    }

    private static bool IsTargetUnitCompatibleWithType(HabitType type, string unit)
    {
        string normalizedUnit = unit.ToLowerInvariant();

        return type switch
        {
            // Binary habits should only use count-based units
            HabitType.Binary => AllowedUnitsForBinaryHabits.Contains(normalizedUnit),

            // Measurable habits can use any of the allowed units
            HabitType.Measurable => AllowedUnits.Contains(normalizedUnit),
            
            // None is not valid
            _ => false 
        };
    }
}
