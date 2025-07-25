using DevHabit.Api.Database;
using DevHabit.Api.DTOs.Auth;
using DevHabit.Api.DTOs.Users;
using DevHabit.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DevHabit.Api.Controllers;

[ApiController]
[Route("auth")]
[AllowAnonymous]
public sealed class AuthController(
    UserManager<IdentityUser> userManager,
    ApplicationIdentityDbContext identityDbContext,
    ApplicationDbContext applicationDbContext) 
    : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto registerUserDto)
    {
        using IDbContextTransaction transaction = await identityDbContext.Database.BeginTransactionAsync();
        // This only works if the 2 contexts use the same database (connection string):
        applicationDbContext.Database.SetDbConnection(identityDbContext.Database.GetDbConnection());
        // Share the other transaction.
        await applicationDbContext.Database.UseTransactionAsync(transaction.GetDbTransaction());

        // Create identity user
        var identityUser = new IdentityUser
        {
            Email = registerUserDto.Email,
            UserName = registerUserDto.Email
        };

        IdentityResult identityResult = await userManager.CreateAsync(identityUser, registerUserDto.Password);

        if (!identityResult.Succeeded)
        {
            var extensions = new Dictionary<string, object?>
            {
                { 
                    "errors", 
                    identityResult.Errors.ToDictionary(e => e.Code, e => e.Description) 
                }
            };

            return Problem(
                detail: "Unable to register user, please try again.",
                statusCode: StatusCodes.Status400BadRequest,
                extensions: extensions);
        }

        // Create app user
        User user = registerUserDto.ToEntity();
        user.IdentityId = identityUser.Id;

        applicationDbContext.Users.Add(user);

        await applicationDbContext.SaveChangesAsync();

        await transaction.CommitAsync(); // Both databases.

        return Ok(user.Id);
    }
}
