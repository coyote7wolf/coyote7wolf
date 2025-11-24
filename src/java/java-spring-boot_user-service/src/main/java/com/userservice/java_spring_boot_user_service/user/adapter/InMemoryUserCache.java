package com.userservice.java_spring_boot_user_service.user.adapter;

import com.userservice.java_spring_boot_user_service.user.model.User;
import com.userservice.java_spring_boot_user_service.user.port.UserCache;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class InMemoryUserCache implements UserCache {
  private final Map<UUID, User> cache = new ConcurrentHashMap<>();

  @Override
  public Optional<User> get(UUID id) {
    return Optional.ofNullable(cache.get(id));
  }

  @Override
  public void put(User user) {
    cache.put(user.getId(), user);
  }

  @Override
  public void evict(UUID id) {
    cache.remove(id);
  }
}
