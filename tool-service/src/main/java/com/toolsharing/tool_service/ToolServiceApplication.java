package com.toolsharing.tool_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ToolServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(ToolServiceApplication.class, args);
	}
}