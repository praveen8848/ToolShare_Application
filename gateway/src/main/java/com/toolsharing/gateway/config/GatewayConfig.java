package com.toolsharing.gateway.config;

import com.toolsharing.gateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Autowired
    @Qualifier("userKeyResolver")
    private KeyResolver userKeyResolver;

    @Autowired
    @Qualifier("ipKeyResolver")
    private KeyResolver ipKeyResolver;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // ==================== AUTH SERVICE ====================
                // Auth Service - Public Routes
                .route("auth-service-public", r -> r
                        .path("/api/auth/login", "/api/auth/register", "/api/auth/check-email")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(false)))
                                .circuitBreaker(config -> config
                                        .setName("auth-service")
                                        .setFallbackUri("forward:/fallback/auth"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(ipKeyResolver)))
                        .uri("lb://AUTH-SERVICE"))

                // Auth Service - Protected Routes
                .route("auth-service-protected", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("auth-service")
                                        .setFallbackUri("forward:/fallback/auth"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://AUTH-SERVICE"))

                // ==================== USER SERVICE ====================
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("user-service")
                                        .setFallbackUri("forward:/fallback/user"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://USER-SERVICE"))

                // ==================== TOOL SERVICE ====================
                // IMPORTANT: Protected GET routes (must come BEFORE public GET)
                .route("tool-service-protected-get", r -> r
                        .path("/api/tools/my-tools", "/api/tools/user/**")
                        .and().method("GET")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("tool-service")
                                        .setFallbackUri("forward:/fallback/tool"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://TOOL-SERVICE"))

                // Tool Service - Public GET (browsing tools)
                .route("tool-service-public", r -> r
                        .path("/api/tools/**")
                        .and().method("GET")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(false)))
                                .circuitBreaker(config -> config
                                        .setName("tool-service")
                                        .setFallbackUri("forward:/fallback/tool"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(ipKeyResolver)))
                        .uri("lb://TOOL-SERVICE"))

                // Tool Service - Protected (POST, PUT, DELETE, PATCH)
                .route("tool-service-protected", r -> r
                        .path("/api/tools/**")
                        .and().method("POST", "PUT", "DELETE", "PATCH")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("tool-service")
                                        .setFallbackUri("forward:/fallback/tool"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://TOOL-SERVICE"))

                // Category Service (uses same TOOL-SERVICE)
                .route("category-service", r -> r
                        .path("/api/categories/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("tool-service")
                                        .setFallbackUri("forward:/fallback/tool"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://TOOL-SERVICE"))

                // ==================== BOOKING SERVICE ====================
                .route("booking-service", r -> r
                        .path("/api/bookings/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config(true)))
                                .circuitBreaker(config -> config
                                        .setName("booking-service")
                                        .setFallbackUri("forward:/fallback/booking"))
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(userKeyResolver)))
                        .uri("lb://BOOKING-SERVICE"))

                .build();
    }
}