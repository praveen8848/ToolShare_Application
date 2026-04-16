package com.toolsharing.tool_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cache.annotation.EnableCaching;


@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
@EnableCaching
public class ToolServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(ToolServiceApplication.class, args);
	}
}