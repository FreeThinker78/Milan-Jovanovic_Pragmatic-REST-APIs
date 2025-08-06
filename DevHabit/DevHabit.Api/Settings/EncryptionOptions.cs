namespace DevHabit.Api.Settings;

public sealed class EncryptionOptions
{
    public const string SectionName = "Encryption";

    public required string Key { get; init; }
}
