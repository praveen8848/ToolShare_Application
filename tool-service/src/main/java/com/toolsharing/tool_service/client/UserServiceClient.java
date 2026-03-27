package com.toolsharing.tool_service.client;

import com.toolsharing.tool_service.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8082}")
public interface UserServiceClient {

    @GetMapping("/api/users/{userId}")
    UserDto getUserById(@PathVariable("userId") Long userId);
}
