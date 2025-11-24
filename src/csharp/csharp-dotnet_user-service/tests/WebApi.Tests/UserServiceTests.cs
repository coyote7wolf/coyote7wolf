using WebApi.Users;
using Xunit;

namespace WebApi.Tests;

public class UserServiceTests
{
    private readonly IUserService _svc;
    private readonly InMemoryUserEventsPublisher _publisher;

    public UserServiceTests()
    {
        var repo = new InMemoryUserRepository();
        var cache = new InMemoryUserCache();
        _publisher = new InMemoryUserEventsPublisher();
        _svc = new UserService(repo, cache, _publisher);
    }

    [Fact]
    public async Task Create_Get_Update_Delete_flow()
    {
        var created = await _svc.CreateAsync(new CreateUserRequest("test@example.com", "Tester"));
        Assert.Equal("test@example.com", created.Email);
        var fetched = await _svc.GetAsync(created.Id);
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched!.Id);
        var updated = await _svc.UpdateAsync(created.Id, new UpdateUserRequest(null, "Tester2"));
        Assert.Equal("Tester2", updated!.DisplayName);
        var list = await _svc.ListAsync();
        Assert.Single(list);
        var deleted = await _svc.DeleteAsync(created.Id);
        Assert.True(deleted);
        var afterDelete = await _svc.GetAsync(created.Id);
        Assert.Null(afterDelete);
        Assert.Contains(_publisher.Events, e => e.Event == "user.created");
        Assert.Contains(_publisher.Events, e => e.Event == "user.updated");
        Assert.Contains(_publisher.Events, e => e.Event == "user.deleted");
    }
}
