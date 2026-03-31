package com.toolsharing.booking_service.controller;

import com.toolsharing.booking_service.dto.request.CreateBookingRequest;
import com.toolsharing.booking_service.dto.response.AvailabilityResponse;
import com.toolsharing.booking_service.dto.response.BookingResponse;
import com.toolsharing.booking_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    private final BookingService bookingService;

    // Check availability for a tool
    @GetMapping("/availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @RequestParam Long itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        logger.info("Checking availability for tool: {} from {} to {}", itemId, startDate, endDate);
        AvailabilityResponse response = bookingService.checkAvailability(itemId, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    // Create a new booking request
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateBookingRequest request) {

        logger.info("Creating booking request for user: {}", userId);
        BookingResponse response = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all bookings for current user
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Fetching bookings for user: {}", userId);
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    // Get bookings for a specific tool (owner view)
    @GetMapping("/tool/{toolId}")
    public ResponseEntity<List<BookingResponse>> getToolBookings(@PathVariable Long toolId) {
        logger.info("Fetching bookings for tool: {}", toolId);
        List<BookingResponse> bookings = bookingService.getToolBookings(toolId);
        return ResponseEntity.ok(bookings);
    }

    // Approve a booking (owner action)
    @PutMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long ownerId) {

        logger.info("Approving booking: {} by owner: {}", bookingId, ownerId);
        BookingResponse response = bookingService.approveBooking(bookingId, ownerId);
        return ResponseEntity.ok(response);
    }

    // Reject a booking (owner action)
    @PutMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long ownerId) {

        logger.info("Rejecting booking: {} by owner: {}", bookingId, ownerId);
        BookingResponse response = bookingService.rejectBooking(bookingId, ownerId);
        return ResponseEntity.ok(response);
    }

    // Cancel a booking (borrower action)
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Cancelling booking: {} by user: {}", bookingId, userId);
        BookingResponse response = bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok(response);
    }

    // Return an item (borrower action - scan QR)
    @PostMapping("/{bookingId}/return")
    public ResponseEntity<BookingResponse> returnItem(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Returning item for booking: {} by user: {}", bookingId, userId);
        BookingResponse response = bookingService.returnItem(bookingId, userId);
        return ResponseEntity.ok(response);
    }
    // Get pending bookings for owner (based on their tools)
    @GetMapping("/pending")
    public ResponseEntity<List<BookingResponse>> getPendingBookings(
            @RequestHeader("X-User-Id") Long ownerId) {

        logger.info("Fetching pending bookings for owner: {}", ownerId);
        List<BookingResponse> bookings = bookingService.getPendingBookingsForOwner(ownerId);
        return ResponseEntity.ok(bookings);
    }

}