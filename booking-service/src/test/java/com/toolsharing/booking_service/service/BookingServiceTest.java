package com.toolsharing.booking_service.service;

import com.toolsharing.booking_service.client.ToolDto;
import com.toolsharing.booking_service.client.ToolServiceClient;
import com.toolsharing.booking_service.client.UserDto;
import com.toolsharing.booking_service.client.UserServiceClient;
import com.toolsharing.booking_service.dto.request.ApproveBookingRequest;
import com.toolsharing.booking_service.dto.request.CreateBookingRequest;
import com.toolsharing.booking_service.dto.response.AvailabilityResponse;
import com.toolsharing.booking_service.dto.response.BookingResponse;
import com.toolsharing.booking_service.entity.Booking;
import com.toolsharing.booking_service.entity.BookingStatus;
import com.toolsharing.booking_service.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ToolServiceClient toolServiceClient;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingService bookingService;

    private ToolDto sampleTool;
    private UserDto ownerDto;
    private UserDto borrowerDto;
    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        sampleTool = new ToolDto(1L, "Cordless Drill", "AVAILABLE", 100L, BigDecimal.valueOf(25.00), BigDecimal.valueOf(50.00));

        ownerDto = new UserDto();
        ownerDto.setUserId(100L);
        ownerDto.setName("Owner Name");
        ownerDto.setEmail("owner@example.com");

        borrowerDto = new UserDto();
        borrowerDto.setUserId(200L);
        borrowerDto.setName("Borrower Name");
        borrowerDto.setEmail("borrower@example.com");

        sampleBooking = new Booking();
        sampleBooking.setId(10L);
        sampleBooking.setItemId(1L);
        sampleBooking.setBorrowerId(200L);
        sampleBooking.setStartDate(LocalDate.now().plusDays(2));
        sampleBooking.setEndDate(LocalDate.now().plusDays(5));
        sampleBooking.setStatus(BookingStatus.PENDING);
        sampleBooking.setTotalAmount(BigDecimal.valueOf(75.00));
        sampleBooking.setDepositAmount(BigDecimal.valueOf(50.00));
    }

    @Test
    void checkAvailability_WhenNoConflicts_ShouldReturnAvailable() {
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(3);

        when(bookingRepository.findConfirmedOverlappingBookings(1L, start, end)).thenReturn(Collections.emptyList());
        when(bookingRepository.findPendingBookingsByItem(1L)).thenReturn(Collections.emptyList());

        AvailabilityResponse response = bookingService.checkAvailability(1L, start, end);

        assertNotNull(response);
        assertTrue(response.isAvailable());
    }

    @Test
    void createBooking_WhenValidRequest_ShouldCreateBooking() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setItemId(1L);
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(5));

        when(toolServiceClient.getToolById(1L)).thenReturn(sampleTool);
        when(bookingRepository.findConfirmedOverlappingBookingsWithLock(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);
        when(userServiceClient.getUserById(100L)).thenReturn(ownerDto);
        when(userServiceClient.getUserById(200L)).thenReturn(borrowerDto);

        BookingResponse response = bookingService.createBooking(200L, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        verify(bookingRepository).save(any(Booking.class));
        verify(rabbitTemplate).convertAndSend(eq("toolshare_exchange"), eq("notification_routing_key"), any(Object.class));
    }

    @Test
    void createBooking_WhenBookingOwnTool_ShouldThrowBadRequest() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setItemId(1L);
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(5));

        when(toolServiceClient.getToolById(1L)).thenReturn(sampleTool);

        assertThrows(ResponseStatusException.class, () -> bookingService.createBooking(100L, request));
    }

    @Test
    void createBooking_WhenConflictExists_ShouldThrowConflict() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setItemId(1L);
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(5));

        when(toolServiceClient.getToolById(1L)).thenReturn(sampleTool);
        when(bookingRepository.findConfirmedOverlappingBookingsWithLock(eq(1L), any(), any()))
                .thenReturn(List.of(sampleBooking));

        assertThrows(ResponseStatusException.class, () -> bookingService.createBooking(200L, request));
    }

    @Test
    void rejectBooking_WhenCalledByOwner_ShouldReject() {
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(sampleBooking));
        when(toolServiceClient.getToolById(1L)).thenReturn(sampleTool);
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);
        when(userServiceClient.getUserById(200L)).thenReturn(borrowerDto);

        BookingResponse response = bookingService.rejectBooking(10L, 100L);

        assertNotNull(response);
        assertEquals(BookingStatus.REJECTED, sampleBooking.getStatus());
        verify(bookingRepository).save(sampleBooking);
    }

    @Test
    void cancelBooking_WhenCalledByBorrower_ShouldCancel() {
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);

        BookingResponse response = bookingService.cancelBooking(10L, 200L);

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, sampleBooking.getStatus());
        verify(bookingRepository).save(sampleBooking);
    }
}
