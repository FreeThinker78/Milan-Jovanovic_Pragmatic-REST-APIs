using DevHabit.Api.Database;
using DevHabit.Api.DTOs.GitHub;
using DevHabit.Api.Entities;
using DevHabit.Api.Services;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace DevHabit.Api.Jobs;

[DisallowConcurrentExecution]
public sealed class GitHubHabitProcessorJob(
    ApplicationDbContext dbContext,
    GitHubAccessTokenService gitHubAccessTokenService,
    GitHubService gitHubService,
    ILogger<GitHubHabitProcessorJob> logger)
    : IJob
{
    private const string PushEventType = "PushEvent";

    public async Task Execute(IJobExecutionContext context)
    {
        string habitId = context.JobDetail.JobDataMap.GetString("habitId")
            ?? throw new InvalidOperationException("HabitId not found in job data.");

        try
        {
            logger.LogInformation("Processing GitHub events for habit {HabitId}.", habitId);

            // Get the habit and ensure it still exists and is configured for GitHub automation
            Habit? habit = await dbContext.Habits
                .FirstOrDefaultAsync(h => h.Id == habitId &&
                    h.AutomationSource == AutomationSource.GitHub &&
                    !h.IsArchived,
                    context.CancellationToken);

            if (habit is null)
            {
                logger.LogWarning("Habit {HabitId} not found, not active, or no longer configured for GitHub automation.", habitId);
                return;
            }

            // Get the user's GitHub access token
            string? accessToken = await gitHubAccessTokenService.GetAsync(habit.UserId, context.CancellationToken);

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                logger.LogWarning("No GitHub access token found for user {UserId}.", habit.UserId);
                return;
            }

            // Get GitHub profile
            GitHubUserProfileDto? profile = await gitHubService.GetUserProfileAsync(
                accessToken,
                context.CancellationToken);

            if (profile is null)
            {
                logger.LogWarning("Could not retreive GitHub profile for user {UserId}.", habit.UserId);
                return;
            }

            // Get GitHub events
            List<GitHubEventDto> gitHubEvents = [];
            const int perPage = 100;
            const int pagesToFetch = 10;

            for (int page = 1; page <= pagesToFetch; page++)
            {
                IReadOnlyList<GitHubEventDto>? pageEvents = await gitHubService.GetUserEventsAsync(
                    profile.Login,
                    accessToken,
                    page,
                    perPage,
                    context.CancellationToken);

                if (pageEvents is null || !pageEvents.Any())
                {
                    break;
                }

                gitHubEvents.AddRange(pageEvents);
            }

            if (!gitHubEvents.Any())
            {
                logger.LogWarning("Could not retrieve GitHub events for user {UserId}.", habit.UserId);
                return;
            }

            // Filter to push events
            var pushEvents = gitHubEvents
                .Where(a => a.Type == PushEventType)
                .ToList();

            logger.LogInformation("Found {Count} push events for habit {HabitId}", pushEvents.Count, habitId);

            foreach( GitHubEventDto gitHubEventDto in pushEvents)
            {
                // Check if we already have an entry for this event
                bool exists = await dbContext.Entries.AnyAsync(
                    e => e.HabitId == habitId &&
                         e.ExternalId == gitHubEventDto.Id,
                    context.CancellationToken);

                if (exists)
                {
                    logger.LogDebug("Entry already exists for event {EventId}.", gitHubEventDto.Id);
                    continue;
                }

                // Create a new entry
                var entry = new Entry
                {
                    Id = $"e_{Guid.CreateVersion7()}",
                    HabitId = habit.Id,
                    UserId = habit.UserId,
                    Value = 1, // Each push counts as 1
                    Notes =
                        $"""
                        {gitHubEventDto.Actor.Login} pushed:

                        {string.Join(
                            Environment.NewLine,
                            gitHubEventDto.Payload.Commits?.Select(c => $"- {c.Message}") ?? [])}
                        """,
                    Date = DateOnly.FromDateTime(gitHubEventDto.CreatedAt),
                    Source = EntrySource.Automation,
                    ExternalId = gitHubEventDto.Id,
                    CreatedAtUtc = DateTime.UtcNow
                };

                dbContext.Entries.Add(entry);
                logger.LogInformation(
                    "Created entry for event {EventId} on habit {HabitId}.",
                    gitHubEventDto.Id,
                    habitId);
            }

            await dbContext.SaveChangesAsync(context.CancellationToken);
            logger.LogInformation("Completed processing GitHub events for habit {HabitId}.", habitId);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Error processing GitHub events for habit {HabitId}.",
                habitId);
            throw;
        }
    }
}
