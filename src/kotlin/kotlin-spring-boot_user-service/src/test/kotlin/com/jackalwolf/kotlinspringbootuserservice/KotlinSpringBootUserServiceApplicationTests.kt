package com.jackalwolf.kotlinspringbootuserservice

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("mock")
class KotlinSpringBootUserServiceApplicationTests {
    @Test
    fun contextLoads() = Unit
}
