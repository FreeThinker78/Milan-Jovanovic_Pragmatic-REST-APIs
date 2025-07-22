using DevHabit.Api.Database;
using DevHabit.Api.Middleware;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Newtonsoft.Json.Serialization;
using Npgsql;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using DevHabit.Api.Services.Sorting;
using DevHabit.Api.Services;
using DevHabit.Api.DTOs.Habits;
using DevHabit.Api.Entities;

namespace DevHabit.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddControllers(this WebApplicationBuilder builder)
    {
        builder.Services.AddControllers(options =>
        {
            options.ReturnHttpNotAcceptable = true;
        })
        .AddNewtonsoftJson(options => options.SerializerSettings.ContractResolver =
            new CamelCasePropertyNamesContractResolver())
        .AddXmlSerializerFormatters();

        builder.Services.AddOpenApi();

        return builder;
    }

    public static WebApplicationBuilder AddErrorHandling(this WebApplicationBuilder builder)
    {
        builder.Services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);
            };
        });

        builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

        return builder;
    }

    public static WebApplicationBuilder AddDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options
            .UseNpgsql(
                builder.Configuration.GetConnectionString("Database"),
                npgsqlOptions => npgsqlOptions
                    .MigrationsHistoryTable(HistoryRepository.DefaultTableName, Schemas.Application))
                    .UseSnakeCaseNamingConvention());


        return builder;
    }

    public static WebApplicationBuilder AddObservability(this WebApplicationBuilder builder)
    {
        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(builder.Environment.ApplicationName))
            .WithTracing(tracing => tracing
                .AddHttpClientInstrumentation()
                .AddAspNetCoreInstrumentation()
                .AddNpgsql())
            .WithMetrics(metrics => metrics
                .AddHttpClientInstrumentation()
                .AddAspNetCoreInstrumentation()
                .AddRuntimeInstrumentation())
            .UseOtlpExporter();

        builder.Logging.AddOpenTelemetry(options =>
        {
            options.IncludeScopes = true;
            options.IncludeFormattedMessage = true;
        });

        return builder;
    }

    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

        builder.Services.AddTransient<SortMappingProvider>();
        builder.Services.AddSingleton<ISortMappingDefinition, SortMappingDefinition<HabitDto, Habit>>(_ =>
            HabitMappings.SortMapping);

        builder.Services.AddTransient<DataShapingService>();

        return builder;
    }
}
