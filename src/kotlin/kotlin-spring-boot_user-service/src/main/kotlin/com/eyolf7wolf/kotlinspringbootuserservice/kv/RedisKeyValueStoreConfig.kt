package com.jackalwolf.kotlinspringbootuserservice.kv

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.data.redis.core.StringRedisTemplate

private class RedisTemplateKeyValueStore(
    private val template: StringRedisTemplate,
) : KeyValueStore {
    override fun increment(key: String): Long {
        return template.opsForValue().increment(key) ?: 0L
    }

    override fun get(key: String): String? {
        return template.opsForValue().get(key)
    }

    override fun set(
        key: String,
        value: String,
    ) {
        template.opsForValue().set(key, value)
    }
}

@Configuration
@Profile("!mock")
class RedisKeyValueStoreConfig {
    @Bean
    fun redisKeyValueStore(template: StringRedisTemplate): KeyValueStore {
        return RedisTemplateKeyValueStore(template)
    }
}
