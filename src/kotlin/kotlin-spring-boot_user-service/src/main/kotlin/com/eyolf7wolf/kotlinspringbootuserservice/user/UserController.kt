package com.jackalwolf.kotlinspringbootuserservice.user

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User", description = "User management CRUD operations")
class UserController(
    private val userService: UserService,
) {
    @GetMapping("/{id}")
    @Operation(
        summary = "Get user by id",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "User found",
                content = [
                    Content(
                        schema = Schema(implementation = UserResponse::class),
                    ),
                ],
            ),
            ApiResponse(responseCode = "404", description = "User not found"),
        ],
    )
    fun getUserById(
        @PathVariable id: Long,
    ): ResponseEntity<UserResponse> {
        return userService.getUser(id)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
    }

    @GetMapping
    @Operation(summary = "List all users")
    fun listUsers(): ResponseEntity<List<UserResponse>> {
        return ResponseEntity.ok(userService.listUsers())
    }

    @PostMapping
    @Operation(summary = "Create user")
    fun createUser(
        @RequestBody request: UserCreateRequest,
    ): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userService.createUser(request))
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody request: UserUpdateRequest,
    ): ResponseEntity<UserResponse> {
        return userService.updateUser(id, request)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    fun deleteUser(
        @PathVariable id: Long,
    ): ResponseEntity<Void> {
        return if (userService.deleteUser(id)) ResponseEntity.noContent().build() else ResponseEntity.notFound().build()
    }
}
