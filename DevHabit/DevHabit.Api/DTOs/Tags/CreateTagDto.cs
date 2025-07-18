namespace DevHabit.Api.DTOs.Tags;

public sealed class CreateTagDto
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
