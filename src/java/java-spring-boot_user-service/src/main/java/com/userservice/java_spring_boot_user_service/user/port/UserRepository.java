package com.userservice.java_spring_boot_user_service.user.port;

import com.userservice.java_spring_boot_user_service.user.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
  User save(User user);

  Optional<User> findById(UUID id);

  Optional<User> findByEmail(String email);

  List<User> findAll();

  void deleteById(UUID id);
}
