package com.streamingapp.chatservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class AppConfig {

    // shared concurrent hashmap to track active users in the chat
    @Bean
    public ConcurrentHashMap<String, Set<String>> activeUsers() {
        return new ConcurrentHashMap<>();
    }
} 