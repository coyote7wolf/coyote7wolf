namespace WebApi.Users;

/// <summary>
/// Aggregate root representing a user in the system.
/// </summary>
public sealed record User
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public DateTime CreatedUtc { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedUtc { get; set; }
}

/// <summary>
/// DTO used when creating a user.
/// </summary>
public sealed record CreateUserRequest(string Email, string DisplayName);

/// <summary>
/// DTO used when updating a user.
/// </summary>
public sealed record UpdateUserRequest(string? Email, string? DisplayName);

/// <summary>
/// Response DTO for user operations.
/// </summary>
public sealed record UserResponse(Guid Id, string Email, string DisplayName, DateTime CreatedUtc, DateTime? UpdatedUtc)
{
    public static UserResponse FromEntity(User u) => new(u.Id, u.Email, u.DisplayName, u.CreatedUtc, u.UpdatedUtc);
}
