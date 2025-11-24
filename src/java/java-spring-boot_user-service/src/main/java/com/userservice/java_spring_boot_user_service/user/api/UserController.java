package com.userservice.java_spring_boot_user_service.user.api;

import com.userservice.java_spring_boot_user_service.user.dto.UserRequest;
import com.userservice.java_spring_boot_user_service.user.dto.UserResponse;
import com.userservice.java_spring_boot_user_service.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User management CRUD operations")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping
  @Operation(
      summary = "Create a new user",
      responses = {
        @ApiResponse(
            responseCode = "201",
            description = "Created",
            content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content)
      })
  public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
    UserResponse created = userService.create(request);
    var location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  @GetMapping("/{id}")
  @Operation(
      summary = "Get user by ID",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "404", description = "Not Found", content = @Content)
      })
  public ResponseEntity<UserResponse> get(
      @Parameter(description = "User ID", required = true) @PathVariable UUID id) {
    return ResponseEntity.ok(userService.get(id));
  }

  @GetMapping
  @Operation(
      summary = "List all users",
      responses = {@ApiResponse(responseCode = "200", description = "OK")})
  public ResponseEntity<List<UserResponse>> list() {
    return ResponseEntity.ok(userService.list());
  }

  @PutMapping("/{id}")
  @Operation(
      summary = "Update a user",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "Updated",
            content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
        @ApiResponse(responseCode = "404", description = "Not Found", content = @Content),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content)
      })
  public ResponseEntity<UserResponse> update(
      @Parameter(description = "User ID", required = true) @PathVariable UUID id,
      @Valid @RequestBody UserRequest request) {
    return ResponseEntity.ok(userService.update(id, request));
  }

  @DeleteMapping("/{id}")
  @Operation(
      summary = "Delete a user",
      responses = {
        @ApiResponse(responseCode = "204", description = "Deleted"),
        @ApiResponse(responseCode = "404", description = "Not Found", content = @Content)
      })
  public ResponseEntity<Void> delete(
      @Parameter(description = "User ID", required = true) @PathVariable UUID id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
