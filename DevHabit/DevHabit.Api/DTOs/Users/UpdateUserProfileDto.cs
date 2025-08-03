namespace DevHabit.Api.DTOs.Users;

public sealed record UpdateUserProfileDto
{
    public required string Name { get; init; }
}
