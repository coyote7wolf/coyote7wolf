namespace WebApi.Users;

public interface IUserRepository
{
    Task<User?> GetAsync(Guid id, CancellationToken ct = default);
    Task<User> AddAsync(User user, CancellationToken ct = default);
    Task<User?> UpdateAsync(User user, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    IAsyncEnumerable<User> ListAsync(CancellationToken ct = default);
}

public interface IUserCache
{
    Task<User?> GetAsync(Guid id, CancellationToken ct = default);
    Task SetAsync(User user, CancellationToken ct = default);
    Task InvalidateAsync(Guid id, CancellationToken ct = default);
}

public interface IUserEventsPublisher
{
    Task PublishAsync(string eventName, User user, CancellationToken ct = default);
}

public interface IUserService
{
    Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<UserResponse?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<UserResponse>> ListAsync(CancellationToken ct = default);
    Task<UserResponse?> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
}
