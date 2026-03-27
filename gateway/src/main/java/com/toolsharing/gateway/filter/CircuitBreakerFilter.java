//package com.toolsharing.gateway.filter;
//
//import io.github.resilience4j.circuitbreaker.CircuitBreaker;
//import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
//import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
//import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.core.Ordered;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//import java.util.concurrent.TimeUnit;
//
//import java.time.Duration;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Component
//public class CircuitBreakerFilter implements GlobalFilter, Ordered {
//
//    private static final Logger logger = LoggerFactory.getLogger(CircuitBreakerFilter.class);
//
//    private final CircuitBreakerRegistry circuitBreakerRegistry;
//    private final ConcurrentHashMap<String, CircuitBreaker> circuitBreakers = new ConcurrentHashMap<>();
//
//    public CircuitBreakerFilter() {
//        // Configure default circuit breaker settings
//        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
//                .slidingWindowSize(10)                    // Number of requests to consider
//                .failureRateThreshold(50)                 // 50% failure rate opens circuit
//                .waitDurationInOpenState(Duration.ofSeconds(30))  // Wait 30 seconds before half-open
//                .permittedNumberOfCallsInHalfOpenState(3) // Allow 3 calls in half-open state
//                .slowCallDurationThreshold(Duration.ofSeconds(5)) // 5 seconds threshold for slow calls
//                .slowCallRateThreshold(60)                // 60% slow calls opens circuit
//                .build();
//
//        this.circuitBreakerRegistry = CircuitBreakerRegistry.of(config);
//    }
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
//        String serviceId = getServiceId(exchange);
//
//        if (serviceId == null) {
//            return chain.filter(exchange);
//        }
//
//        // Get or create circuit breaker for this service
//        CircuitBreaker circuitBreaker = circuitBreakers.computeIfAbsent(
//                serviceId,
//                id -> circuitBreakerRegistry.circuitBreaker(id)
//        );
//
//        // Get circuit breaker state
//        CircuitBreaker.State state = circuitBreaker.getState();
//        logger.debug("Circuit breaker for {} is in {} state", serviceId, state);
//
//        // If circuit is OPEN, return fallback immediately
//        if (state == CircuitBreaker.State.OPEN) {
//            logger.warn("Circuit breaker OPEN for service: {}. Returning fallback response.", serviceId);
//            return handleFallback(exchange, serviceId);
//        }
//
//        // Apply circuit breaker operator to the request
//        return chain.filter(exchange)
//                .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
//                .onErrorResume(throwable -> {
//                    logger.error("Error calling service: {}. Error: {}", serviceId, throwable.getMessage());
//                    circuitBreaker.onError(0, TimeUnit.MILLISECONDS, throwable);
//                    return handleFallback(exchange, serviceId);
//                });
//    }
//
//    private String getServiceId(ServerWebExchange exchange) {
//        String path = exchange.getRequest().getPath().toString();
//
//        if (path.contains("/api/auth")) return "auth-service";
//        if (path.contains("/api/users")) return "user-service";
//        if (path.contains("/api/tools")) return "tool-service";
//        if (path.contains("/api/bookings")) return "booking-service";
//
//        return null;
//    }
//
//    private Mono<Void> handleFallback(ServerWebExchange exchange, String serviceId) {
//        exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
//        exchange.getResponse().getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
//
//        String responseBody = String.format(
//                "{\"error\": \"Service Unavailable\", " +
//                        "\"message\": \"%s is currently unavailable. Please try again later.\", " +
//                        "\"status\": \"503\"}",
//                serviceId
//        );
//
//        return exchange.getResponse()
//                .writeWith(Mono.just(exchange.getResponse()
//                        .bufferFactory()
//                        .wrap(responseBody.getBytes())));
//    }
//
//    @Override
//    public int getOrder() {
//        // Run after logging filter, before authentication
//        return 0;
//    }
//}