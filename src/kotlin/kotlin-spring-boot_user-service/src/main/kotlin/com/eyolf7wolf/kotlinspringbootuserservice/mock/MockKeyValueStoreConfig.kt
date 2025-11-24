package com.jackalwolf.kotlinspringbootuserservice.mock

import com.jackalwolf.kotlinspringbootuserservice.kv.KeyValueStore
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.util.concurrent.ConcurrentHashMap

private class InMemoryKeyValueStore : KeyValueStore {
    private val data = ConcurrentHashMap<String, String>()

    override fun increment(key: String): Long {
        val next = (data[key]?.toLongOrNull() ?: 0L) + 1
        data[key] = next.toString()
        return next
    }

    override fun get(key: String): String? {
        return data[key]
    }

    override fun set(
        key: String,
        value: String,
    ) {
        data[key] = value
    }
}

@Configuration
@Profile("mock")
class MockKeyValueStoreConfig {
    @Bean
    fun keyValueStore(): KeyValueStore {
        return InMemoryKeyValueStore()
    }
}
