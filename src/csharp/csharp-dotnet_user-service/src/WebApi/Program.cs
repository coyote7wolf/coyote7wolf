using Microsoft.AspNetCore.HttpOverrides;
using WebApi.Users;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Users feature registrations (mock infra via in-memory implementations)
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
builder.Services.AddSingleton<IUserCache, InMemoryUserCache>();
builder.Services.AddSingleton<IUserEventsPublisher, InMemoryUserEventsPublisher>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));

var users = app.MapGroup("/api/v1/users").WithTags("Users");

users.MapGet("", async (IUserService svc, CancellationToken ct) =>
{
    var list = await svc.ListAsync(ct);
    return Results.Ok(list);
})
.WithName("ListUsers")
.WithSummary("List users")
.WithDescription("Returns all users.");

users.MapGet("/{id:guid}", async (Guid id, IUserService svc, CancellationToken ct) =>
{
    var user = await svc.GetAsync(id, ct);
    return user is null ? Results.NotFound() : Results.Ok(user);
})
.WithName("GetUser")
.WithSummary("Get user")
.WithDescription("Returns a single user by id.");

users.MapPost("", async (CreateUserRequest req, IUserService svc, CancellationToken ct) =>
{
    try
    {
        var created = await svc.CreateAsync(req, ct);
        return Results.Created($"/api/v1/users/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message, param = ex.ParamName });
    }
})
.WithName("CreateUser")
.WithSummary("Create user")
.WithDescription("Creates a new user.");

users.MapPut("/{id:guid}", async (Guid id, UpdateUserRequest req, IUserService svc, CancellationToken ct) =>
{
    var updated = await svc.UpdateAsync(id, req, ct);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
})
.WithName("UpdateUser")
.WithSummary("Update user")
.WithDescription("Updates an existing user.");

users.MapDelete("/{id:guid}", async (Guid id, IUserService svc, CancellationToken ct) =>
{
    var deleted = await svc.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteUser")
.WithSummary("Delete user")
.WithDescription("Deletes a user by id.");

app.Run();

// Needed for integration tests with WebApplicationFactory
public partial class Program { }
