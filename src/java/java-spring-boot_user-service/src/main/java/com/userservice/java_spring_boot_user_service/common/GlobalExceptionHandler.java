package com.userservice.java_spring_boot_user_service.common;

import com.userservice.java_spring_boot_user_service.api.ErrorResponse;
import com.userservice.java_spring_boot_user_service.api.ValidationErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      IllegalArgumentException ex, HttpServletRequest request) {
    return error(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ErrorResponse> handleConflict(
      IllegalStateException ex, HttpServletRequest request) {
    return error(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationErrorResponse> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<ValidationErrorResponse.FieldViolation> violations =
        ex.getBindingResult().getFieldErrors().stream()
            .map(this::toViolation)
            .collect(Collectors.toList());
    ValidationErrorResponse body =
        ValidationErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            HttpStatus.BAD_REQUEST.getReasonPhrase(),
            violations,
            request.getRequestURI());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  private ValidationErrorResponse.FieldViolation toViolation(FieldError fe) {
    return new ValidationErrorResponse.FieldViolation(fe.getField(), fe.getDefaultMessage());
  }

  private ResponseEntity<ErrorResponse> error(HttpStatus status, String message, String path) {
    return ResponseEntity.status(status)
        .body(ErrorResponse.of(status.value(), status.getReasonPhrase(), message, path));
  }
}
