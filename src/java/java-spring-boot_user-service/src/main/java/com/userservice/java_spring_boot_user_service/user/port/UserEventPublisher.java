package com.userservice.java_spring_boot_user_service.user.port;

import com.userservice.java_spring_boot_user_service.user.model.User;

public interface UserEventPublisher {
  void userCreated(User user);

  void userUpdated(User user);

  void userDeleted(User user);
}
