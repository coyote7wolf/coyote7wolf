package com.userservice.java_spring_boot_user_service.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Generic error response")
public record ErrorResponse(
    @Schema(description = "Timestamp in ISO-8601", example = "2024-01-01T12:34:56.789Z")
        String timestamp,
    @Schema(description = "HTTP status code", example = "404") int status,
    @Schema(description = "HTTP reason phrase", example = "Not Found") String error,
    @Schema(description = "Error message details", example = "User not found") String message,
    @Schema(description = "Request path", example = "/api/v1/users/123") String path) {

  public static ErrorResponse of(int status, String error, String message, String path) {
    return new ErrorResponse(Instant.now().toString(), status, error, message, path);
  }
}
