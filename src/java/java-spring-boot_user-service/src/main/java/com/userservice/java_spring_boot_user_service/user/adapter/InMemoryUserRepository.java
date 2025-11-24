package com.userservice.java_spring_boot_user_service.user.adapter;

import com.userservice.java_spring_boot_user_service.user.model.User;
import com.userservice.java_spring_boot_user_service.user.port.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryUserRepository implements UserRepository {
  private final Map<UUID, User> storage = new ConcurrentHashMap<>();

  @Override
  public User save(User user) {
    storage.put(user.getId(), user);
    return user;
  }

  @Override
  public Optional<User> findById(UUID id) {
    return Optional.ofNullable(storage.get(id));
  }

  @Override
  public Optional<User> findByEmail(String email) {
    return storage.values().stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst();
  }

  @Override
  public List<User> findAll() {
    return new ArrayList<>(storage.values());
  }

  @Override
  public void deleteById(UUID id) {
    storage.remove(id);
  }
}
