namespace DevHabit.Api.Services;

public sealed record SortMapping(string SortField, string PropertyName, bool Reverse = false);

public interface ISortMappingDefinition;
