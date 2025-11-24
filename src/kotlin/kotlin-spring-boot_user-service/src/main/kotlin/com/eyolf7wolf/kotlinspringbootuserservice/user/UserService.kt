package com.jackalwolf.kotlinspringbootuserservice.user

import com.jackalwolf.kotlinspringbootuserservice.kv.KeyValueStore
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val messageQueue: MessageQueue,
    private val keyValueStore: KeyValueStore,
) {
    fun getUser(id: Long): UserResponse? {
        val entity = userRepository.findById(id) ?: return null
        val redisKey = lookupKey(id)
        keyValueStore.increment(redisKey)
        val messages = messageQueue.receive("user-$id")
        return entity.toResponse(
            lookupCount = keyValueStore.get(redisKey)?.toLongOrNull() ?: 0L,
            queueMessages = messages,
        )
    }

    fun listUsers(): List<UserResponse> =
        userRepository.findAll().map { entity ->
            val redisKey = lookupKey(entity.id)
            entity.toResponse(
                lookupCount = keyValueStore.get(redisKey)?.toLongOrNull() ?: 0L,
                queueMessages = messageQueue.receive("user-${entity.id}"),
            )
        }

    fun createUser(req: UserCreateRequest): UserResponse {
        val id = System.currentTimeMillis()
        val entity = userRepository.save(UserEntity(id = id, name = req.name, email = req.email))
        val redisKey = lookupKey(entity.id)
        keyValueStore.set(redisKey, "0")
        messageQueue.send("user-${entity.id}", "User created: ${entity.name}")
        return entity.toResponse(lookupCount = 0, queueMessages = emptyList())
    }

    fun updateUser(
        id: Long,
        req: UserUpdateRequest,
    ): UserResponse? {
        val existing = userRepository.findById(id) ?: return null
        val updatedEntity = existing.copy(name = req.name ?: existing.name, email = req.email ?: existing.email)
        val stored = userRepository.update(updatedEntity) ?: return null
        messageQueue.send("user-$id", "User updated: ${stored.name}")
        val redisKey = lookupKey(id)
        return stored.toResponse(
            lookupCount = keyValueStore.get(redisKey)?.toLongOrNull() ?: 0L,
            queueMessages = messageQueue.receive("user-$id"),
        )
    }

    fun deleteUser(id: Long): Boolean {
        val deleted = userRepository.delete(id)
        if (deleted) {
            messageQueue.send("user-$id", "User deleted: $id")
        }
        return deleted
    }

    private fun UserEntity.toResponse(
        lookupCount: Long,
        queueMessages: List<String>,
    ) = UserResponse(
        id = id,
        name = name,
        email = email,
        lookupCount = lookupCount,
        queueMessages = queueMessages,
    )

    private fun lookupKey(id: Long): String = "user:lookup:$id"
}
