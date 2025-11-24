package com.userservice.java_spring_boot_user_service.user.adapter;

import com.userservice.java_spring_boot_user_service.user.model.User;
import com.userservice.java_spring_boot_user_service.user.port.UserEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class NoOpUserEventPublisher implements UserEventPublisher {
  @Override
  public void userCreated(User user) {
    /* no-op */
  }

  @Override
  public void userUpdated(User user) {
    /* no-op */
  }

  @Override
  public void userDeleted(User user) {
    /* no-op */
  }
}
