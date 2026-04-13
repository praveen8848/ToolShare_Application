package com.toolsharing.booking_service.service;

import com.toolsharing.booking_service.client.ToolDto;
import com.toolsharing.booking_service.client.ToolServiceClient;
import com.toolsharing.booking_service.client.UserDto;
import com.toolsharing.booking_service.client.UserServiceClient;
import com.toolsharing.booking_service.dto.NotificationEvent;
import com.toolsharing.booking_service.dto.request.ApproveBookingRequest;
import com.toolsharing.booking_service.dto.request.CreateBookingRequest;
import com.toolsharing.booking_service.dto.response.AvailabilityResponse;
import com.toolsharing.booking_service.dto.response.BookingResponse;
import com.toolsharing.booking_service.dto.response.ConflictBooking;
import com.toolsharing.booking_service.dto.response.SuggestedDatesResponse;
import com.toolsharing.booking_service.entity.Booking;
import com.toolsharing.booking_service.entity.BookingStatus;
import com.toolsharing.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final ToolServiceClient toolServiceClient;
    private final UserServiceClient userServiceClient;
    private final RabbitTemplate rabbitTemplate; // ADDED: RabbitMQ Template

    public AvailabilityResponse checkAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be in the past");
        }

        List<Booking> confirmedBookings = bookingRepository.findConfirmedOverlappingBookings(itemId, startDate, endDate);

        if (!confirmedBookings.isEmpty()) {
            return AvailabilityResponse.builder()
                    .available(false)
                    .message("Tool is already booked for these dates")
                    .conflictingBookings(confirmedBookings.stream()
                            .map(b -> ConflictBooking.builder()
                                    .bookingId(b.getId())
                                    .startDate(b.getStartDate())
                                    .endDate(b.getEndDate())
                                    .status(b.getStatus().name())
                                    .build())
                            .collect(Collectors.toList()))
                    .suggestedDates(findAlternativeDates(itemId, startDate, endDate))
                    .build();
        }

        List<Booking> pendingBookings = bookingRepository.findPendingBookingsByItem(itemId);
        int pendingCount = (int) pendingBookings.stream()
                .filter(b -> datesOverlap(b.getStartDate(), b.getEndDate(), startDate, endDate))
                .count();

        if (pendingCount > 0) {
            return AvailabilityResponse.builder()
                    .available(true)
                    .message("Tool has " + pendingCount + " pending request(s) for these dates. You can still book!")
                    .pendingRequests(pendingCount)
                    .build();
        }

        return AvailabilityResponse.builder()
                .available(true)
                .message("Tool is available for selected dates")
                .build();
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#borrowerId"),
            @CacheEvict(value = "availability", key = "#request.getItemId() + '_' + #request.getStartDate() + '_' + #request.getEndDate()")
    })
    @Transactional
    public BookingResponse createBooking(Long borrowerId, CreateBookingRequest request) {
        logger.info("Creating booking for user {}, clearing related caches", borrowerId);

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be in the past");
        }

        ToolDto tool;
        try {
            tool = toolServiceClient.getToolById(request.getItemId());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found");
        }

        if (tool.getOwnerId().equals(borrowerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot book your own tool");
        }

        List<Booking> confirmedOverlaps = bookingRepository.findConfirmedOverlappingBookings(
                request.getItemId(), request.getStartDate(), request.getEndDate());

        if (!confirmedOverlaps.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tool is already booked for these dates");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalAmount = tool.getDailyRate().multiply(BigDecimal.valueOf(days));

        Booking booking = new Booking();
        booking.setItemId(request.getItemId());
        booking.setBorrowerId(borrowerId);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setDepositAmount(tool.getDepositAmount());
        booking.setNotes(request.getNotes());

        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Booking request created: {} by user: {} for tool: {}",
                savedBooking.getId(), borrowerId, request.getItemId());

        return convertToResponse(savedBooking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#result.borrowerId"),
            @CacheEvict(value = "booking", key = "#bookingId"),
            @CacheEvict(value = "availability", allEntries = true)
    })
    @Transactional
    public BookingResponse approveBooking(Long bookingId, Long ownerId, ApproveBookingRequest request) {
        logger.info("Approving booking {}, clearing related caches", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can approve bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already " + booking.getStatus());
        }

        LocalDateTime minPickupDateTime = booking.getStartDate().atStartOfDay().minusDays(1);
        if (request.getPickupDateTime().isAfter(minPickupDateTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pickup must be scheduled at least 1 day before the booking start date: " + booking.getStartDate());
        }

        List<Booking> confirmedOverlaps = bookingRepository.findConfirmedOverlappingBookings(
                booking.getItemId(), booking.getStartDate(), booking.getEndDate());

        if (!confirmedOverlaps.isEmpty()) {
            booking.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dates are no longer available");
        }

        booking.setPickupDateTime(request.getPickupDateTime());
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupInstructions(request.getPickupInstructions());
        booking.setOwnerContact(request.getOwnerContact());
        booking.setContactMethod(request.getContactMethod());

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setApprovedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        toolServiceClient.updateToolStatus(booking.getItemId(), "BORROWED");

        logger.info("Booking approved: {} for tool: {} by owner: {}", bookingId, booking.getItemId(), ownerId);

        // ==========================================
        // ADDED: Publish Notification Event to RabbitMQ
        // ==========================================
        try {
            UserDto borrower = userServiceClient.getUserById(booking.getBorrowerId());

            String emailBody = String.format(
                    "Great news %s!\n\nYour booking for the '%s' has been approved.\n\nPickup Details:\nLocation: %s\nTime: %s\nInstructions: %s\nOwner Contact: %s\n\nHappy building!",
                    borrower.getName(),
                    tool.getName(),
                    request.getPickupLocation(),
                    request.getPickupDateTime().toString(),
                    request.getPickupInstructions(),
                    request.getOwnerContact()
            );

            NotificationEvent event = NotificationEvent.builder()
                    .eventType("BOOKING_APPROVED")
                    .recipientEmail(borrower.getEmail())
                    .subject("Booking Approved: " + tool.getName())
                    .messageBody(emailBody)
                    .build();

            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("Notification event sent to RabbitMQ for booking approval: {}", bookingId);

        } catch (Exception e) {
            logger.error("Failed to send notification event to RabbitMQ for booking approval: {}", bookingId, e);
        }

        return convertToResponse(savedBooking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#result.borrowerId"),
            @CacheEvict(value = "booking", key = "#bookingId")
    })
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, Long ownerId) {
        logger.info("Rejecting booking {}, clearing related caches", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // We fetch this once here to use for both security checks and notification
        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());

        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can reject bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        logger.info("Booking rejected: {} for tool: {} by owner: {}", bookingId, booking.getItemId(), ownerId);

        // ==========================================
        // NOTIFICATION LOGIC
        // ==========================================
        try {

            UserDto borrower = userServiceClient.getUserById(booking.getBorrowerId());

            NotificationEvent event = NotificationEvent.builder()
                    .eventType("BOOKING_REJECTED")
                    .recipientEmail(borrower.getEmail())
                    .subject("Update on your booking: " + tool.getName())
                    .messageBody(String.format(
                            "Hello %s,\n\nUnfortunately, your booking request for '%s' was not accepted at this time.\n\nBrowse other available tools on your dashboard!",
                            borrower.getName(), tool.getName()
                    ))
                    .build();

            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("Rejection notification sent to RabbitMQ for booking: {}", bookingId);
        } catch (Exception e) {
            // We log the error but don't throw it, so the DB update stays saved
            logger.error("Failed to send rejection email for booking: {}", bookingId, e);
        }

        return convertToResponse(savedBooking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#userId"),
            @CacheEvict(value = "booking", key = "#bookingId")
    })
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        logger.info("Cancelling booking {}, clearing related caches", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getBorrowerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel booking with status: " + booking.getStatus());
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Booking cancelled: {} by user: {}", bookingId, userId);

        return convertToResponse(savedBooking);
    }

    @Cacheable(value = "userBookings", key = "#userId", unless = "#result == null || #result.isEmpty()")
    public List<BookingResponse> getUserBookings(Long userId) {
        logger.info("Fetching bookings for user {} from DATABASE (cache miss)", userId);
        List<Booking> bookings = bookingRepository.findByBorrowerIdOrderByCreatedAtDesc(userId);
        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "toolBookings", key = "#toolId", unless = "#result == null || #result.isEmpty()")
    public List<BookingResponse> getToolBookings(Long toolId) {
        logger.info("Fetching bookings for tool {} from DATABASE (cache miss)", toolId);
        List<Booking> bookings = bookingRepository.findByItemIdOrderByCreatedAtDesc(toolId);
        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getOwnerPendingRequests(Long ownerId) {
        List<Booking> pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING);
        return pendingBookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private List<SuggestedDatesResponse> findAlternativeDates(Long itemId, LocalDate startDate, LocalDate endDate) {
        List<SuggestedDatesResponse> suggestions = new ArrayList<>();

        List<Booking> confirmedBookings = bookingRepository.findByItemIdAndStatus(itemId, BookingStatus.CONFIRMED);

        LocalDate latestEndDate = confirmedBookings.stream()
                .map(Booking::getEndDate)
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now().minusDays(1));

        LocalDate alternativeStart = latestEndDate.plusDays(1);
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDate alternativeEnd = alternativeStart.plusDays(days);

        suggestions.add(SuggestedDatesResponse.builder()
                .startDate(alternativeStart)
                .endDate(alternativeEnd)
                .days((int) days)
                .build());

        return suggestions;
    }

    private boolean datesOverlap(LocalDate existingStart, LocalDate existingEnd, LocalDate newStart, LocalDate newEnd) {
        return !(newEnd.isBefore(existingStart) || newStart.isAfter(existingEnd));
    }

    @Cacheable(value = "booking", key = "#bookingId", unless = "#result == null")
    public BookingResponse getBookingById(Long bookingId) {
        logger.info("Fetching booking by id {} from DATABASE (cache miss)", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return convertToResponse(booking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#result.borrowerId"),
            @CacheEvict(value = "booking", key = "#bookingId"),
            @CacheEvict(value = "availability", allEntries = true)
    })
    @Transactional
    public BookingResponse returnItem(Long bookingId, Long scannerId) {
        logger.info("Returning item for booking {}, clearing related caches", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(scannerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the tool owner can confirm returns");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot return booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");

        logger.info("Item returned for booking: {} by owner: {}", bookingId, scannerId);

        return convertToResponse(savedBooking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#userId"),
            @CacheEvict(value = "booking", key = "#bookingId")
    })
    @Transactional
    public BookingResponse requestReturn(Long bookingId, Long userId) {
        logger.info("Return requested for booking {} by user {}", bookingId, userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getBorrowerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only borrower can request return");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot request return for booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.RETURN_REQUESTED);
        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Return requested for booking: {} by borrower: {}", bookingId, userId);

        // ==========================================
        // ADDED: Publish Notification Event to RabbitMQ
        // ==========================================
        try {
            ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
            UserDto owner = userServiceClient.getUserById(tool.getOwnerId());
            UserDto borrower = userServiceClient.getUserById(userId);

            String emailBody = String.format(
                    "Hello %s,\n\n%s has requested to return your '%s'.\n\nPlease log in to your dashboard to confirm the return once you receive it.",
                    owner.getName(),
                    borrower.getName(),
                    tool.getName()
            );

            NotificationEvent event = NotificationEvent.builder()
                    .eventType("RETURN_REQUESTED")
                    .recipientEmail(owner.getEmail())
                    .subject("Return Requested: " + tool.getName())
                    .messageBody(emailBody)
                    .build();

            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("Notification event sent to RabbitMQ for return request: {}", bookingId);

        } catch (Exception e) {
            logger.error("Failed to send notification event to RabbitMQ for return request: {}", bookingId, e);
        }

        return convertToResponse(savedBooking);
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#result.borrowerId"),
            @CacheEvict(value = "booking", key = "#bookingId"),
            @CacheEvict(value = "availability", allEntries = true)
    })
    @Transactional
    public BookingResponse confirmReturn(Long bookingId, Long ownerId) {
        logger.info("Confirming return for booking {} by owner {}", bookingId, ownerId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can confirm returns");
        }

        if (booking.getStatus() != BookingStatus.RETURN_REQUESTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot confirm return. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");

        logger.info("Return confirmed for booking: {} by owner: {}", bookingId, ownerId);

        return convertToResponse(savedBooking);
    }

    public List<BookingResponse> getReturnRequestsForOwner(Long ownerId) {
        List<ToolDto> userTools = toolServiceClient.getToolsByOwner(ownerId);

        if (userTools.isEmpty()) {
            return List.of();
        }

        List<Long> toolIds = userTools.stream()
                .map(ToolDto::getId)
                .collect(Collectors.toList());

        List<Booking> returnRequests = bookingRepository.findByItemIdInAndStatus(toolIds, BookingStatus.RETURN_REQUESTED);

        return returnRequests.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getPendingBookingsForOwner(Long ownerId) {
        List<ToolDto> userTools;
        try {
            userTools = toolServiceClient.getToolsByOwner(ownerId);
        } catch (Exception e) {
            logger.error("Failed to fetch tools for owner: {}", ownerId, e);
            return List.of();
        }

        if (userTools.isEmpty()) {
            return List.of();
        }

        List<Long> toolIds = userTools.stream()
                .map(ToolDto::getId)
                .collect(Collectors.toList());

        List<Booking> pendingBookings = bookingRepository.findByItemIdInAndStatus(toolIds, BookingStatus.PENDING);

        return pendingBookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Caching(evict = {
            @CacheEvict(value = "userBookings", key = "#userId"),
            @CacheEvict(value = "booking", key = "#bookingId"),
            @CacheEvict(value = "toolBookings", allEntries = true)
    })
    @Transactional
    public void deleteBooking(Long bookingId, Long userId) {
        logger.info("Deleting booking {}, clearing related caches", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isBorrower = booking.getBorrowerId().equals(userId);
        boolean isOwner = false;

        try {
            ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
            isOwner = tool.getOwnerId().equals(userId);
        } catch (Exception e) {
            logger.warn("Tool not found (ID: {}) while checking permissions for booking deletion. Tool may have been deleted.", booking.getItemId());
        }

        if (!isBorrower && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own bookings");
        }

        BookingStatus status = booking.getStatus();
        if (status != BookingStatus.REJECTED &&
                status != BookingStatus.CANCELLED &&
                status != BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete booking with status: " + status + ". Only rejected, cancelled, or completed bookings can be deleted.");
        }

        bookingRepository.delete(booking);
        logger.info("Booking deleted: {} by user: {}", bookingId, userId);
    }

    private BookingResponse convertToResponse(Booking booking) {
        String itemName = "Unknown";
        Long ownerId = null;
        try {
            ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
            itemName = tool.getName();
            ownerId = tool.getOwnerId();
        } catch (Exception e) {
            logger.warn("Could not fetch tool details for: {}", booking.getItemId());
        }

        String borrowerName = "Unknown";
        try {
            UserDto user = userServiceClient.getUserById(booking.getBorrowerId());
            borrowerName = user.getName();
        } catch (Exception e) {
            logger.warn("Could not fetch borrower details for: {}", booking.getBorrowerId());
        }

        String ownerName = "Unknown";
        if (ownerId != null) {
            try {
                UserDto owner = userServiceClient.getUserById(ownerId);
                ownerName = owner.getName();
            } catch (Exception e) {
                logger.warn("Could not fetch owner details for: {}", ownerId);
            }
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .itemId(booking.getItemId())
                .itemName(itemName)
                .borrowerId(booking.getBorrowerId())
                .borrowerName(borrowerName)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus().name())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .notes(booking.getNotes())
                .pickupDateTime(booking.getPickupDateTime())
                .pickupLocation(booking.getPickupLocation())
                .pickupInstructions(booking.getPickupInstructions())
                .ownerContact(booking.getOwnerContact())
                .contactMethod(booking.getContactMethod())
                .createdAt(booking.getCreatedAt())
                .approvedAt(booking.getApprovedAt())
                .completedAt(booking.getCompletedAt())
                .build();
    }
}