using System.Collections.Concurrent;

namespace WebApi.Users;

/// <summary>
/// In-memory repository simulating a database.
/// </summary>
public sealed class InMemoryUserRepository : IUserRepository
{
    private readonly ConcurrentDictionary<Guid, User> _store = new();

    public Task<User?> GetAsync(Guid id, CancellationToken ct = default) =>
        Task.FromResult(_store.TryGetValue(id, out var u) ? u : null);

    public Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        if (!_store.TryAdd(user.Id, user))
            throw new InvalidOperationException("Failed to add user");
        return Task.FromResult(user);
    }

    public Task<User?> UpdateAsync(User user, CancellationToken ct = default)
    {
        if (!_store.ContainsKey(user.Id)) return Task.FromResult<User?>(null);
        _store[user.Id] = user;
        return Task.FromResult<User?>(user);
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
        => Task.FromResult(_store.TryRemove(id, out _));

    public async IAsyncEnumerable<User> ListAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        foreach (var u in _store.Values)
        {
            ct.ThrowIfCancellationRequested();
            yield return u;
            await Task.Yield();
        }
    }
}

/// <summary>
/// In-memory cache simulating Redis.
/// </summary>
public sealed class InMemoryUserCache : IUserCache
{
    private readonly ConcurrentDictionary<Guid, (User user, DateTime expires)> _cache = new();
    private readonly TimeSpan _ttl = TimeSpan.FromMinutes(5);

    public Task<User?> GetAsync(Guid id, CancellationToken ct = default)
    {
        if (_cache.TryGetValue(id, out var entry))
        {
            if (entry.expires > DateTime.UtcNow) return Task.FromResult<User?>(entry.user);
            _cache.TryRemove(id, out _); // expired
        }
        return Task.FromResult<User?>(null);
    }

    public Task SetAsync(User user, CancellationToken ct = default)
    {
        _cache[user.Id] = (user, DateTime.UtcNow.Add(_ttl));
        return Task.CompletedTask;
    }

    public Task InvalidateAsync(Guid id, CancellationToken ct = default)
    {
        _cache.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}

/// <summary>
/// In-memory events publisher simulating a message queue.
/// Stores published events for inspection in tests.
/// </summary>
public sealed class InMemoryUserEventsPublisher : IUserEventsPublisher
{
    private readonly List<(string Event, User User)> _events = new();
    public IReadOnlyList<(string Event, User User)> Events => _events;

    public Task PublishAsync(string eventName, User user, CancellationToken ct = default)
    {
        _events.Add((eventName, user));
        return Task.CompletedTask;
    }
}
