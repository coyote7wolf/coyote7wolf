package com.userservice.java_spring_boot_user_service.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequest(
    @Email @NotBlank String email, @NotBlank @Size(min = 2, max = 50) String displayName) {}
