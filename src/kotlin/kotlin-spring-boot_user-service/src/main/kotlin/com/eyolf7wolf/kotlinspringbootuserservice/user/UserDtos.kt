package com.jackalwolf.kotlinspringbootuserservice.user

data class UserCreateRequest(val name: String, val email: String)

data class UserUpdateRequest(
    val name: String? = null,
    val email: String? = null,
)

data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val lookupCount: Long = 0,
    val queueMessages: List<String> = emptyList(),
)
