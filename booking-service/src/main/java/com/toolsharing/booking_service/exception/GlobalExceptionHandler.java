package com.toolsharing.booking_service.exception;

import com.toolsharing.booking_service.dto.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler providing RFC 7807 Problem Details error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingHeader(MissingRequestHeaderException ex, WebRequest request) {
        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/missing-header")
                .title("Missing Required Header")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("Required header '" + ex.getHeaderName() + "' is not present")
                .instance(path)
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/" + ex.getStatusCode().value())
                .title(ex.getStatusCode().toString())
                .status(ex.getStatusCode().value())
                .detail(ex.getReason())
                .instance(path)
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> validationErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/validation")
                .title("Validation Failed")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("Request validation failed")
                .instance(path)
                .timestamp(Instant.now())
                .errors(validationErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unhandled exception in booking-service: ", ex);
        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/internal-server-error")
                .title("Internal Server Error")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .detail("An unexpected error occurred.")
                .instance(path)
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}