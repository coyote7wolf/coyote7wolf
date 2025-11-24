package com.userservice.java_spring_boot_user_service.api;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Validation error response containing per-field errors")
public record ValidationErrorResponse(
    @Schema(description = "Timestamp in ISO-8601", example = "2024-01-01T12:34:56.789Z")
        String timestamp,
    @Schema(description = "HTTP status code", example = "400") int status,
    @Schema(description = "HTTP reason phrase", example = "Bad Request") String error,
    @ArraySchema(arraySchema = @Schema(description = "List of field validation errors"))
        List<FieldViolation> violations,
    @Schema(description = "Request path", example = "/api/v1/users") String path) {

  public static ValidationErrorResponse of(
      int status, String error, List<FieldViolation> violations, String path) {
    return new ValidationErrorResponse(
        java.time.Instant.now().toString(), status, error, violations, path);
  }

  @Schema(description = "A single field validation violation")
  public record FieldViolation(
      @Schema(description = "Field name", example = "email") String field,
      @Schema(description = "Validation message", example = "must be a well-formed email address")
          String message) {}
}
