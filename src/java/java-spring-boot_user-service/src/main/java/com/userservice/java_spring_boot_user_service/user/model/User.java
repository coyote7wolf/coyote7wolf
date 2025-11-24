package com.userservice.java_spring_boot_user_service.user.model;

import java.time.Instant;
import java.util.UUID;

public class User {
  private final UUID id;
  private String email;
  private String displayName;
  private boolean active;
  private final Instant createdAt;
  private Instant updatedAt;

  private User(
      UUID id,
      String email,
      String displayName,
      boolean active,
      Instant createdAt,
      Instant updatedAt) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.active = active;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static User createNew(String email, String displayName) {
    Instant now = Instant.now();
    return new User(UUID.randomUUID(), email, displayName, true, now, now);
  }

  public UUID getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public String getDisplayName() {
    return displayName;
  }

  public boolean isActive() {
    return active;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void update(String email, String displayName, Boolean active) {
    if (email != null) this.email = email;
    if (displayName != null) this.displayName = displayName;
    if (active != null) this.active = active;
    this.updatedAt = Instant.now();
  }
}
