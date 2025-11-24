package com.userservice.java_spring_boot_user_service.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.userservice.java_spring_boot_user_service.user.dto.UserRequest;
import com.userservice.java_spring_boot_user_service.user.dto.UserResponse;
import com.userservice.java_spring_boot_user_service.user.model.User;
import com.userservice.java_spring_boot_user_service.user.port.UserCache;
import com.userservice.java_spring_boot_user_service.user.port.UserEventPublisher;
import com.userservice.java_spring_boot_user_service.user.port.UserRepository;
import com.userservice.java_spring_boot_user_service.user.service.UserService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class UserServiceTest {

  private UserRepository repository;
  private UserCache cache;
  private UserEventPublisher publisher;
  private UserService service;

  @BeforeEach
  void setup() {
    repository = Mockito.mock(UserRepository.class);
    cache = Mockito.mock(UserCache.class);
    publisher = Mockito.mock(UserEventPublisher.class);
    service = new UserService(repository, cache, publisher);
  }

  @Test
  void create_success() {
    UserRequest req = new UserRequest("a@example.com", "Alice");
    when(repository.findByEmail("a@example.com")).thenReturn(Optional.empty());
    when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    UserResponse res = service.create(req);

    assertThat(res.email()).isEqualTo("a@example.com");
    verify(publisher).userCreated(any());
  }

  @Test
  void create_duplicateEmail() {
    User existing = User.createNew("a@example.com", "A");
    when(repository.findByEmail("a@example.com")).thenReturn(Optional.of(existing));
    UserRequest req = new UserRequest("a@example.com", "Alice");
    assertThatThrownBy(() -> service.create(req)).isInstanceOf(IllegalStateException.class);
  }

  @Test
  void get_notFound() {
    UUID id = UUID.randomUUID();
    when(repository.findById(id)).thenReturn(Optional.empty());
    assertThatThrownBy(() -> service.get(id)).isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void list_success() {
    when(repository.findAll()).thenReturn(List.of(User.createNew("a@example.com", "A")));
    assertThat(service.list()).hasSize(1);
  }
}
