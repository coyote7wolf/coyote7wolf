namespace WebApi.Users;

/// <summary>
/// Application service orchestrating repository, cache and events.
/// </summary>
public sealed class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IUserCache _cache;
    private readonly IUserEventsPublisher _publisher;

    public UserService(IUserRepository repo, IUserCache cache, IUserEventsPublisher publisher)
    {
        _repo = repo; _cache = cache; _publisher = publisher;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        ValidateCreate(request);
        var entity = new User { Email = request.Email.Trim(), DisplayName = request.DisplayName.Trim() };
        await _repo.AddAsync(entity, ct);
        await _cache.SetAsync(entity, ct);
        await _publisher.PublishAsync("user.created", entity, ct);
        return UserResponse.FromEntity(entity);
    }

    public async Task<UserResponse?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var cached = await _cache.GetAsync(id, ct);
        var entity = cached ?? await _repo.GetAsync(id, ct);
        return entity is null ? null : UserResponse.FromEntity(entity);
    }

    public async Task<IReadOnlyList<UserResponse>> ListAsync(CancellationToken ct = default)
    {
        var list = new List<UserResponse>();
        await foreach (var u in _repo.ListAsync(ct))
            list.Add(UserResponse.FromEntity(u));
        return list;
    }

    public async Task<UserResponse?> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var existing = await _repo.GetAsync(id, ct);
        if (existing is null) return null;
        var updated = existing with
        {
            Email = request.Email?.Trim() ?? existing.Email,
            DisplayName = request.DisplayName?.Trim() ?? existing.DisplayName,
            UpdatedUtc = DateTime.UtcNow
        };
        var stored = await _repo.UpdateAsync(updated, ct);
        if (stored is null) return null;
        await _cache.SetAsync(stored, ct);
        await _publisher.PublishAsync("user.updated", stored, ct);
        return UserResponse.FromEntity(stored);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var ok = await _repo.DeleteAsync(id, ct);
        if (ok)
        {
            await _cache.InvalidateAsync(id, ct);
            await _publisher.PublishAsync("user.deleted", new User { Id = id, Email = string.Empty, DisplayName = string.Empty }, ct);
        }
        return ok;
    }

    private static void ValidateCreate(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email)) throw new ArgumentException("Email required", nameof(request.Email));
        if (!request.Email.Contains('@')) throw new ArgumentException("Email invalid", nameof(request.Email));
        if (string.IsNullOrWhiteSpace(request.DisplayName)) throw new ArgumentException("DisplayName required", nameof(request.DisplayName));
    }
}
