package com.jackalwolf.kotlinspringbootuserservice.config

import io.swagger.v3.oas.models.ExternalDocumentation
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {
    @Bean
    fun customOpenAPI(): OpenAPI =
        OpenAPI()
            .info(
                Info()
                    .title("User Management API")
                    .description("Sample Kotlin Spring Boot user CRUD with mock infrastructure")
                    .version("v1")
                    .contact(Contact().name("Dev Team").email("dev@example.com"))
                    .license(License().name("Apache 2.0")),
            )
            .externalDocs(
                ExternalDocumentation()
                    .description("Project Repository")
                    .url("https://github.com/coyote7wolf/kotlin-spring-boot_user-service"),
            )
}
