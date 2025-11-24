package com.jackalwolf.kotlinspringbootuserservice.user

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put

@WebMvcTest(UserController::class)
class UserControllerTest {
    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @MockBean
    lateinit var userService: UserService

    @Test
    fun `get user not found returns 404`() {
        whenever(userService.getUser(999L)).thenReturn(null)
        mockMvc.get("/api/v1/user/999").andExpect { status { isNotFound() } }
    }

    @Test
    fun `create then fetch user`() {
        val created = UserResponse(1L, "AAA", "a@a", 0, emptyList())
        whenever(userService.createUser(any())).thenReturn(created)
        whenever(userService.getUser(1L)).thenReturn(created.copy(lookupCount = 1))

        mockMvc.post("/api/v1/user") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(UserCreateRequest("AAA", "a@a"))
        }.andExpect { status { isOk() } }

        val body =
            mockMvc.get("/api/v1/user/1")
                .andExpect { status { isOk() } }
                .andReturn().response.contentAsString

        val resp = objectMapper.readValue(body, UserResponse::class.java)
        assertEquals(1L, resp.lookupCount)
    }

    @Test
    fun `list users returns array`() {
        whenever(userService.listUsers()).thenReturn(listOf(UserResponse(1L, "AAA", "a@a", 0, emptyList())))
        mockMvc.get("/api/v1/user").andExpect { status { isOk() } }
    }

    @Test
    fun `update user not found`() {
        whenever(userService.updateUser(any(), any())).thenReturn(null)
        mockMvc.put("/api/v1/user/123") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(UserUpdateRequest(name = "BBB"))
        }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `delete user`() {
        whenever(userService.deleteUser(1L)).thenReturn(true)
        mockMvc.delete("/api/v1/user/1")
            .andExpect { status { isNoContent() } }
    }
}
