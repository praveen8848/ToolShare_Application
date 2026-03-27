package com.toolsharing.gateway.filter;

import com.toolsharing.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/check-email"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();

            // Log the request
            logger.debug("Request path: {}, Secured: {}", path, config.isSecured);

            // Check if endpoint is public (always allow)
            if (isPublicEndpoint(path)) {
                logger.debug("Public endpoint, skipping authentication");
                return chain.filter(exchange);
            }

            // Check if route is secured
            if (!config.isSecured) {
                logger.debug("Route not secured, skipping authentication");
                return chain.filter(exchange);
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                logger.warn("Missing Authorization header for secured endpoint: {}", path);
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("Invalid Authorization header format for endpoint: {}", path);
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                logger.warn("Invalid or expired JWT token for endpoint: {}", path);
                return onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
            }

            // Extract user information
            Long userId = jwtUtil.getUserIdFromToken(token);
            String userEmail = jwtUtil.getEmailFromToken(token);
            String userName = jwtUtil.getNameFromToken(token);
            String userRole = jwtUtil.getRoleFromToken(token);

            logger.debug("Token validated successfully for user: {} ({})", userName, userId);

            // Add user information to headers for downstream services
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", String.valueOf(userId))
                    .header("X-User-Email", userEmail != null ? userEmail : "")
                    .header("X-User-Name", userName != null ? userName : "")
                    .header("X-User-Role", userRole != null ? userRole : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().set("Content-Type", "application/json");
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, httpStatus.value());
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    public static class Config {
        private boolean isSecured = true;

        public Config() {}

        public Config(boolean isSecured) {
            this.isSecured = isSecured;
        }

        public boolean isSecured() {
            return isSecured;
        }

        public void setSecured(boolean secured) {
            isSecured = secured;
        }
    }
}