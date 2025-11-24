package com.userservice.java_spring_boot_user_service.user.service;

import com.userservice.java_spring_boot_user_service.user.dto.UserRequest;
import com.userservice.java_spring_boot_user_service.user.dto.UserResponse;
import com.userservice.java_spring_boot_user_service.user.model.User;
import com.userservice.java_spring_boot_user_service.user.port.UserCache;
import com.userservice.java_spring_boot_user_service.user.port.UserEventPublisher;
import com.userservice.java_spring_boot_user_service.user.port.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository repository;
  private final UserCache cache;
  private final UserEventPublisher eventPublisher;

  public UserService(
      UserRepository repository, UserCache cache, UserEventPublisher eventPublisher) {
    this.repository = repository;
    this.cache = cache;
    this.eventPublisher = eventPublisher;
  }

  public UserResponse create(UserRequest request) {
    repository
        .findByEmail(request.email())
        .ifPresent(
            u -> {
              throw new IllegalStateException("Email already exists");
            });
    User user = User.createNew(request.email(), request.displayName());
    repository.save(user);
    cache.put(user);
    eventPublisher.userCreated(user);
    return toResponse(user);
  }

  public UserResponse get(UUID id) {
    return cache
        .get(id)
        .or(() -> repository.findById(id))
        .map(this::toResponse)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
  }

  public List<UserResponse> list() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  public UserResponse update(UUID id, UserRequest request) {
    User user =
        repository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (!user.getEmail().equalsIgnoreCase(request.email())
        && repository.findByEmail(request.email()).isPresent()) {
      throw new IllegalStateException("Email already exists");
    }
    user.update(request.email(), request.displayName(), null);
    repository.save(user);
    cache.put(user);
    eventPublisher.userUpdated(user);
    return toResponse(user);
  }

  public void delete(UUID id) {
    User user =
        repository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    repository.deleteById(id);
    cache.evict(id);
    eventPublisher.userDeleted(user);
  }

  private UserResponse toResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getDisplayName(),
        user.isActive(),
        user.getCreatedAt(),
        user.getUpdatedAt());
  }
}
