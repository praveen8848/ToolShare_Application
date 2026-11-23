package com.toolsharing.user_service.controller;

import com.toolsharing.user_service.dto.ErrorResponse;
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
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

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

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(MultipartException ex, WebRequest request) {
        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/multipart-error")
                .title("Multipart Error")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("File upload error: " + ex.getMessage())
                .instance(path)
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        String path = request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
        ErrorResponse error = ErrorResponse.builder()
                .type("/errors/bad-request")
                .title("Bad Request")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail(ex.getMessage())
                .instance(path)
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unhandled exception in user-service: ", ex);
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