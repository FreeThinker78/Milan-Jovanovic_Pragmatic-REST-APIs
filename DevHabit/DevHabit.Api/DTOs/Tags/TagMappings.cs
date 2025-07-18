using DevHabit.Api.Entities;

namespace DevHabit.Api.DTOs.Tags;

internal static class TagMappings
{
    public static TagDto ToDto(this Tag tag)
    {
        TagDto dto = new()
        {
            Id = tag.Id,
            Name = tag.Name,
            Description = tag.Description,
            CreatedAtUtc = tag.CreatedAtUtc,
            UpdatedAtUtc = tag.UpdatedAtUtc
        };

        return dto;
    }

    public static Tag ToEntity(this TagDto dto)
    {
        Tag tag = new()
        {
            Id = dto.Id,
            Name = dto.Name,
            Description = dto.Description,
            CreatedAtUtc = dto.CreatedAtUtc,
            UpdatedAtUtc = dto.UpdatedAtUtc
        };

        return tag;
    }

    public static Tag ToEntity(this CreateTagDto dto)
    {
        Tag tag = new()
        {
            Id = $"t_{Guid.CreateVersion7()}",
            Name = dto.Name,
            Description = dto.Description,
            CreatedAtUtc = DateTime.UtcNow
        };
        
        return tag;
    }

    public static void UpdateFromDto(this Tag tag, UpdateTagDto dto)
    {
        tag.Name = dto.Name;
        tag.Description = dto.Description;
        tag.UpdatedAtUtc = DateTime.UtcNow;
    }
}
