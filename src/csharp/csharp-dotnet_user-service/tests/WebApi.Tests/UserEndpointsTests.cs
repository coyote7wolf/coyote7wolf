using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using WebApi.Users;
using Xunit;

namespace WebApi.Tests;

public class UserEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    public UserEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(_ => { });
    }

    [Fact]
    public async Task Users_CRUD_smoke()
    {
        var client = _factory.CreateClient();

        var createReq = new CreateUserRequest("crud@example.com", "Crud User");
        var createResp = await client.PostAsJsonAsync("/api/v1/users", createReq);
        Assert.Equal(HttpStatusCode.Created, createResp.StatusCode);
        var created = await createResp.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(created);

        var getResp = await client.GetAsync($"/api/v1/users/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);

        var updateResp = await client.PutAsJsonAsync($"/api/v1/users/{created.Id}", new UpdateUserRequest(null, "Updated"));
        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var updated = await updateResp.Content.ReadFromJsonAsync<UserResponse>();
        Assert.Equal("Updated", updated!.DisplayName);

        var listResp = await client.GetAsync("/api/v1/users");
        Assert.Equal(HttpStatusCode.OK, listResp.StatusCode);

        var deleteResp = await client.DeleteAsync($"/api/v1/users/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        var getAfterDelete = await client.GetAsync($"/api/v1/users/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getAfterDelete.StatusCode);
    }
}
