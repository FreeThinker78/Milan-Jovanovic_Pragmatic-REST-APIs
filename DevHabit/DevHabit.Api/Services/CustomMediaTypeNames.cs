namespace DevHabit.Api.Services;

public static class CustomMediaTypeNames
{
    public static class Application
    {
        public const string JsonV1 = "application/json;v=1";
        public const string JsonV2 = "application/json;v=2";
        public const string HateoasJson = "application/vnd.dev-habit.hateoas+json";
        public const string HateoasJsonV1 = "application/vnd.dev-habit.hateoas.1+json";
        public const string HateoasJsonV2 = "application/vnd.dev-habit.hateoas.2+json";
    }

    public static bool IsHateoas(this string? accept)
    {
        return accept is not null && accept.ToLower().Contains("hateoas");
    }
}
