namespace DevHabit.Api.Settings;

public sealed class TagsOptions
{
    public const string SectionName = "Tags";

    public int? UserTagsLimit { get; init; }
}
