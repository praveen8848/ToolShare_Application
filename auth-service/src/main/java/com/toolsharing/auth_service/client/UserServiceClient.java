package com.toolsharing.auth_service.client;

import com.toolsharing.auth_service.dto.UserSyncDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @PostMapping("/api/users/sync")
    void syncUser(@RequestBody UserSyncDto userSyncDto);
}