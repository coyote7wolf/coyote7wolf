package com.userservice.java_spring_boot_user_service.user;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.java_spring_boot_user_service.user.api.UserController;
import com.userservice.java_spring_boot_user_service.user.dto.UserRequest;
import com.userservice.java_spring_boot_user_service.user.dto.UserResponse;
import com.userservice.java_spring_boot_user_service.user.service.UserService;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = UserController.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private UserService userService;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setup() {
    objectMapper = new ObjectMapper();
  }

  @Test
  void create_validationError() throws Exception {
    UserRequest req = new UserRequest("bad-email", "A");
    mockMvc
        .perform(
            post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_success_201_locationHeader() throws Exception {
    UUID id = UUID.fromString("00000000-0000-0000-0000-000000000001");
    UserResponse resp =
        new UserResponse(
            id,
            "user@example.com",
            "User",
            true,
            Instant.parse("2024-01-01T00:00:00Z"),
            Instant.parse("2024-01-01T00:00:00Z"));
    given(userService.create(any())).willReturn(resp);

    UserRequest req = new UserRequest("user@example.com", "User");
    mockMvc
        .perform(
            post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", "http://localhost/api/v1/users/" + id))
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.email").value("user@example.com"));
  }

  @Test
  void get_notFound_404() throws Exception {
    UUID id = UUID.fromString("00000000-0000-0000-0000-000000000099");
    given(userService.get(id)).willThrow(new IllegalArgumentException("User not found"));
    mockMvc.perform(get("/api/v1/users/" + id)).andExpect(status().isNotFound());
  }

  @Test
  void update_success_200() throws Exception {
    UUID id = UUID.fromString("00000000-0000-0000-0000-000000000002");
    UserResponse resp =
        new UserResponse(
            id,
            "new@example.com",
            "New Name",
            true,
            Instant.parse("2024-01-01T00:00:00Z"),
            Instant.parse("2024-01-02T00:00:00Z"));
    given(userService.update(eq(id), any())).willReturn(resp);
    UserRequest req = new UserRequest("new@example.com", "New Name");
    mockMvc
        .perform(
            put("/api/v1/users/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(id.toString()))
        .andExpect(jsonPath("$.email").value("new@example.com"))
        .andExpect(jsonPath("$.displayName").value("New Name"));
  }

  @Test
  void delete_success_204() throws Exception {
    UUID id = UUID.fromString("00000000-0000-0000-0000-000000000005");
    doNothing().when(userService).delete(id);
    mockMvc.perform(delete("/api/v1/users/" + id)).andExpect(status().isNoContent());
  }
}
