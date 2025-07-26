namespace DevHabit.Api.DTOs.Auth;

public class LoginUserDto
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
