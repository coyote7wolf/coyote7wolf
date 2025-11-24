package com.jackalwolf.kotlinspringbootuserservice.user

/**
 * Domain layer abstractions & entity for User bounded context.
 * These are intentionally simple and framework-agnostic to satisfy SOLID (ISP, DIP)
 * so higher layers (service/controller) depend on abstractions not concrete mock implementations.
 */

data class UserEntity(
    val id: Long,
    val name: String,
    val email: String,
)

interface UserRepository {
    fun findById(id: Long): UserEntity?

    fun findAll(): List<UserEntity>

    fun save(user: UserEntity): UserEntity

    fun update(user: UserEntity): UserEntity?

    fun delete(id: Long): Boolean
}

interface MessageQueue {
    fun send(
        topic: String,
        message: String,
    )

    fun receive(topic: String): List<String>
}
