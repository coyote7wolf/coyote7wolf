package com.jackalwolf.kotlinspringbootuserservice.mock

import com.jackalwolf.kotlinspringbootuserservice.user.MessageQueue
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

private class InMemoryMessageQueue : MessageQueue {
    private val queue = mutableMapOf<String, MutableList<String>>()

    override fun send(
        topic: String,
        message: String,
    ) {
        queue.computeIfAbsent(topic) { mutableListOf() }.add(message)
    }

    override fun receive(topic: String): List<String> = queue[topic]?.toList() ?: emptyList()
}

@Configuration
@Profile("mock")
class MockMessageQueueConfig {
    @Bean
    fun messageQueue(): MessageQueue = InMemoryMessageQueue()
}
