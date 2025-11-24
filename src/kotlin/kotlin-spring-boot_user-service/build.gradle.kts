plugins {
    id("org.jlleitschuh.gradle.ktlint") version "12.1.1"
    id("io.gitlab.arturbosch.detekt") version "1.23.7"
    jacoco
    kotlin("jvm") version "2.0.10"
    kotlin("plugin.spring") version "2.0.10"
    kotlin("plugin.jpa") version "2.0.10"
    id("org.springframework.boot") version "3.5.5"

    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.eyolf7wolf"
version = "0.0.1-SNAPSHOT"
description = "User Management Service"
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-amqp")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("org.springframework.amqp:spring-rabbit-test")
    // Mockito Kotlin extensions (optional, though tests now use BDDMockito core APIs)
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.7")
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = freeCompilerArgs + "-Xjsr305=strict"
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}
ktlint {
    version.set("1.2.1")
    android.set(false)
    outputToConsole.set(true)
}

detekt {
    config.setFrom(files("detekt.yml"))
    allRules = false
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

// Fail build if line coverage below threshold (can adjust later)
tasks.register<JacocoCoverageVerification>("jacocoCoverageVerification") {
    dependsOn(tasks.test)
    violationRules {
        rule {
            limit {
                minimum = "0.70".toBigDecimal() // Raise baseline to 70%
            }
        }
    }
    classDirectories.setFrom(
        files(
            classDirectories.files.map { file ->
                fileTree(file) {
                    // Exclude Spring auto-generated or config placeholders if desired
                    exclude("**/config/**")
                }
            },
        ),
    )
}

tasks.check { dependsOn("jacocoCoverageVerification") }
