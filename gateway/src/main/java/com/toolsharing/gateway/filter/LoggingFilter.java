package com.toolsharing.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Generate correlation ID for tracing
        String correlationId = UUID.randomUUID().toString();

        // Add correlation ID to request headers for downstream services
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Correlation-Id", correlationId)
                .build();

        // Log request
        logger.info("=== REQUEST START ===");
        logger.info("Correlation ID: {}", correlationId);
        logger.info("Method: {}", mutatedRequest.getMethod());
        logger.info("URI: {}", mutatedRequest.getURI());
        logger.info("Headers: {}", mutatedRequest.getHeaders());
        logger.info("Remote Address: {}", mutatedRequest.getRemoteAddress());

        // Record start time
        long startTime = System.currentTimeMillis();

        // Process the request
        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .then(Mono.fromRunnable(() -> {
                    ServerHttpResponse response = exchange.getResponse();
                    long duration = System.currentTimeMillis() - startTime;

                    // Log response
                    logger.info("=== RESPONSE ===");
                    logger.info("Correlation ID: {}", correlationId);
                    logger.info("Status Code: {}", response.getStatusCode());
                    logger.info("Duration: {} ms", duration);
                    logger.info("=== REQUEST END ===");

                    // Log slow requests
                    if (duration > 3000) {
                        logger.warn("Slow request detected! URI: {}, Duration: {} ms",
                                mutatedRequest.getURI(), duration);
                    }
                }));
    }

    @Override
    public int getOrder() {
        // Run this filter first (highest precedence)
        return -1;
    }
}