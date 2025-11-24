package com.userservice.java_spring_boot_user_service.user.port;

import com.userservice.java_spring_boot_user_service.user.model.User;
import java.util.Optional;
import java.util.UUID;

public interface UserCache {
  Optional<User> get(UUID id);

  void put(User user);

  void evict(UUID id);
}
