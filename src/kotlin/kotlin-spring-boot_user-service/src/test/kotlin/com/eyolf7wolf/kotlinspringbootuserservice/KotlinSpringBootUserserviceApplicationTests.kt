package com.eyolf7wolf.kotlinspringbootuserservice

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("mock")
class KotlinSpringBootUserserviceApplicationTests {
    @Test
    fun contextLoads() = Unit
}
