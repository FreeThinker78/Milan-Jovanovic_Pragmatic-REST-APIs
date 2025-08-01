using DevHabit.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevHabit.Api.Database.Configurations;

public sealed class GitHubAccessTokenConfiguration : IEntityTypeConfiguration<GitHubAccessToken>
{
    public void Configure(EntityTypeBuilder<GitHubAccessToken> builder)
    {
        builder.HasKey(gh => gh.Id);

        builder.Property(gh => gh.Id).HasMaxLength(500);
        builder.Property(gh => gh.UserId).HasMaxLength(500);
        builder.Property(gh => gh.Token).HasMaxLength(1000);

        builder.HasIndex(gh => gh.UserId).IsUnique();

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<GitHubAccessToken>(gh => gh.UserId);
    }
}
