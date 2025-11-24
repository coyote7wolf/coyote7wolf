package com.jackalwolf.kotlinspringbootskeleton

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("mock")
class KotlinSpringBootSkeletonApplicationTests {
    @Test
    fun contextLoads() = Unit
}
