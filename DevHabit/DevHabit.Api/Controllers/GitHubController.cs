using System.Net.Mime;
using DevHabit.Api.DTOs.Common;
using DevHabit.Api.DTOs.GitHub;
using DevHabit.Api.Entities;
using DevHabit.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevHabit.Api.Controllers;

[Authorize(Roles = Roles.Member)]
[ApiController]
[Route("github")]
[Produces(
    MediaTypeNames.Application.Json,
    CustomMediaTypeNames.Application.JsonV1,
    CustomMediaTypeNames.Application.HateoasJson,
    CustomMediaTypeNames.Application.HateoasJsonV1)]
public sealed class GitHubController(
    GitHubAccessTokenService gitHubAccessTokenService,
    GitHubService gitHubService,
    UserContext userContext,
    LinkService linkService)
    : ControllerBase
{
    [HttpPut("personal-access-token")]
    public async Task<IActionResult> StoreAccessToken(StoreGitHubAccessTokenDto storeGitHubAccessTokenDto)
    {
        string? userId = await userContext.GetUserIdAsync();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await gitHubAccessTokenService.StoreAsync(userId, storeGitHubAccessTokenDto);

        return NoContent();
    }

    [HttpDelete("personal-access-token")]
    public async Task<IActionResult> RevokeAccessToken()
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        await gitHubAccessTokenService.RevokeAsync(userId);

        return NoContent();
    }

    [HttpGet("profile")]
    public async Task<ActionResult<GitHubUserProfileDto>> GetUserProfile([FromHeader] AcceptHeaderDto acceptHeader)
    {
        string? userId = await userContext.GetUserIdAsync();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        string? accessToken = await gitHubAccessTokenService.GetAsync(userId);
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return NotFound();
        }

        GitHubUserProfileDto? userProfile = await gitHubService.GetUserProfileAsync(accessToken);
        if (userProfile is null)
        {
            return NotFound();
        }

        if (acceptHeader.IncludeLinks)
        {
            userProfile.Links =
            [
                linkService.Create(nameof(GetUserProfile), "self", HttpMethods.Get),
                linkService.Create(nameof(StoreAccessToken), "store-token", HttpMethods.Put),
                linkService.Create(nameof(RevokeAccessToken), "revoke-token", HttpMethods.Delete)
            ];
        }

        return Ok(userProfile);
    }
}
