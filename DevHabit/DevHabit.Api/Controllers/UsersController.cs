using System.Net.Mime;
using System.Security.Claims;
using DevHabit.Api.Database;
using DevHabit.Api.DTOs.Common;
using DevHabit.Api.DTOs.Users;
using DevHabit.Api.Entities;
using DevHabit.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevHabit.Api.Controllers;

[Authorize(Roles = $"{Roles.Admin},{Roles.Member}")]
[ApiController]
[Route("users")]
[Produces(
    MediaTypeNames.Application.Json,
    CustomMediaTypeNames.Application.JsonV1,
    CustomMediaTypeNames.Application.HateoasJson,
    CustomMediaTypeNames.Application.HateoasJsonV1)]
public sealed class UsersController(
    ApplicationDbContext dbContext,
    UserContext userContext,
    LinkService linkService)
    : ControllerBase
{
    [HttpGet("{id}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<UserDto>> GetUserById(string id)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Communicates that this userId does exist, possible security exposure.
        //if (id != userId)
        //{
        //    return Forbid();
        //}

        UserDto? user = await dbContext.Users
            .Where(u => u.Id == id)
            .Select(UserQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        // Removes security exposure
        if (user is null || user.Id != userId)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser([FromHeader] AcceptHeaderDto acceptHeaderDto)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        UserDto? user = await dbContext.Users
            .Where(u => u.Id == userId)
            .Select(UserQueries.ProjectToDto())
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return NotFound();
        }

        if (acceptHeaderDto.IncludeLinks)
        {
            user.Links = CreateLinksForUser();
        }

        return Ok(user);
    }

    [HttpPut("me/profile")]
    public async Task<ActionResult> UpdateProfile(UpdateUserProfileDto dto)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        User? user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        user.Name = dto.Name;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private List<LinkDto> CreateLinksForUser()
    {
        List<LinkDto> links =
        [
            linkService.Create(nameof(GetCurrentUser), "self", HttpMethods.Get),
            linkService.Create(nameof(UpdateProfile), "update-profile", HttpMethods.Put)
        ];

        return links;
    }
}
