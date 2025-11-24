package com.userservice.java_spring_boot_user_service.user.dto;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String displayName,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {}
