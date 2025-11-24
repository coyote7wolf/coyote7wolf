package com.jackalwolf.kotlinspringbootuserservice.mock

import com.jackalwolf.kotlinspringbootuserservice.user.UserEntity
import com.jackalwolf.kotlinspringbootuserservice.user.UserRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

private class InMemoryUserRepository : UserRepository {
    private val users =
        mutableMapOf<Long, UserEntity>(
            1L to UserEntity(1, "Mock User 1", "mock1@email.com"),
            2L to UserEntity(2, "Mock User 2", "mock2@email.com"),
        )

    override fun findById(id: Long): UserEntity? = users[id]

    override fun findAll(): List<UserEntity> = users.values.sortedBy { it.id }

    override fun save(user: UserEntity): UserEntity {
        users[user.id] = user
        return user
    }

    override fun update(user: UserEntity): UserEntity? {
        if (!users.containsKey(user.id)) return null
        users[user.id] = user
        return user
    }

    override fun delete(id: Long): Boolean = users.remove(id) != null
}

@Configuration
@Profile("mock")
class MockDbConfig {
    @Bean
    fun userRepository(): UserRepository = InMemoryUserRepository()
}
