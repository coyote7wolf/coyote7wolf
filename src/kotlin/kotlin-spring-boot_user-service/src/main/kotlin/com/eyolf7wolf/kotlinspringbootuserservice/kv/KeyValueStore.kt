package com.jackalwolf.kotlinspringbootuserservice.kv

interface KeyValueStore {
    fun increment(key: String): Long

    fun get(key: String): String?

    fun set(
        key: String,
        value: String,
    )
}
