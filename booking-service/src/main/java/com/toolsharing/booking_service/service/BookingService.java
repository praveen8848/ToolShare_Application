package com.toolsharing.booking_service.service;

import com.toolsharing.booking_service.client.ToolDto;
import com.toolsharing.booking_service.client.ToolServiceClient;
import com.toolsharing.booking_service.client.UserDto;
import com.toolsharing.booking_service.client.UserServiceClient;
import com.toolsharing.booking_service.dto.request.CreateBookingRequest;
import com.toolsharing.booking_service.dto.response.AvailabilityResponse;
import com.toolsharing.booking_service.dto.response.BookingResponse;
import com.toolsharing.booking_service.dto.response.ConflictBooking;
import com.toolsharing.booking_service.dto.response.SuggestedDatesResponse;
import com.toolsharing.booking_service.entity.Booking;
import com.toolsharing.booking_service.entity.BookingStatus;
import com.toolsharing.booking_service.repository.BookingRepository;
import com.toolsharing.booking_service.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final QRCodeGenerator qrCodeGenerator;

    // Check availability without blocking (shows pending requests)
    public AvailabilityResponse checkAvailability(Long itemId, LocalDate startDate, LocalDate endDate) {
        // Validate dates
        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be in the past");
        }

        // Check confirmed bookings (blocked)
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

        // Check pending requests (still available, just inform)
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

        // Completely available
        return AvailabilityResponse.builder()
                .available(true)
                .message("Tool is available for selected dates")
                .build();
    }

    // Create booking request (PENDING status)
    @Transactional
    public BookingResponse createBooking(Long borrowerId, CreateBookingRequest request) {
        // Validate dates
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be in the past");
        }

        // Check if tool exists and get details
        ToolDto tool;
        try {
            tool = toolServiceClient.getToolById(request.getItemId());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found");
        }

        // Check if user is not the owner
        if (tool.getOwnerId().equals(borrowerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot book your own tool");
        }

        // Check if there are any CONFIRMED overlapping bookings (blocked)
        List<Booking> confirmedOverlaps = bookingRepository.findConfirmedOverlappingBookings(
                request.getItemId(), request.getStartDate(), request.getEndDate());

        if (!confirmedOverlaps.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tool is already booked for these dates");
        }

        // Calculate total amount
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalAmount = tool.getDailyRate().multiply(BigDecimal.valueOf(days));

        // Create booking with PENDING status
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

    // Owner approves booking
    @Transactional
    public BookingResponse approveBooking(Long bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user is the tool owner
        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can approve bookings");
        }

        // Check if already processed
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already " + booking.getStatus());
        }

        // Double-check no confirmed overlap exists
        List<Booking> confirmedOverlaps = bookingRepository.findConfirmedOverlappingBookings(
                booking.getItemId(), booking.getStartDate(), booking.getEndDate());

        if (!confirmedOverlaps.isEmpty()) {
            booking.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dates are no longer available");
        }

        // Update booking status
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setApprovedAt(java.time.LocalDateTime.now());

        // Generate QR code for pickup/return
        String qrCodeFileName = qrCodeGenerator.generateQRCode(booking.getId(), booking.getBorrowerId(), booking.getItemId());
        booking.setQrCode(qrCodeFileName);

        Booking savedBooking = bookingRepository.save(booking);

        // Update tool status to BORROWED
        toolServiceClient.updateToolStatus(booking.getItemId(), "BORROWED");

        logger.info("Booking approved: {} for tool: {} by owner: {}", bookingId, booking.getItemId(), ownerId);

        return convertToResponse(savedBooking);
    }

    // Owner rejects booking
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user is the tool owner
        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can reject bookings");
        }

        // Check if already processed
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Booking rejected: {} for tool: {} by owner: {}", bookingId, booking.getItemId(), ownerId);

        return convertToResponse(savedBooking);
    }

    // Borrower cancels booking (only if pending or confirmed)
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user is the borrower
        if (!booking.getBorrowerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        // Can only cancel pending or confirmed bookings
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel booking with status: " + booking.getStatus());
        }

        // If confirmed, need to update tool status back to AVAILABLE
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Booking cancelled: {} by user: {}", bookingId, userId);

        return convertToResponse(savedBooking);
    }

//    // Return item (complete booking)
//    @Transactional
//    public BookingResponse returnItem(Long bookingId, Long userId) {
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
//
//        // Verify user is the borrower
//        if (!booking.getBorrowerId().equals(userId)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only borrower can return items");
//        }
//
//        // Can only return confirmed bookings
//        if (booking.getStatus() != BookingStatus.CONFIRMED) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot return booking with status: " + booking.getStatus());
//        }
//
//        booking.setStatus(BookingStatus.COMPLETED);
//        booking.setCompletedAt(java.time.LocalDateTime.now());
//
//        Booking savedBooking = bookingRepository.save(booking);
//
//        // Update tool status back to AVAILABLE
//        toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");
//
//        logger.info("Item returned for booking: {} by user: {}", bookingId, userId);
//
//        return convertToResponse(savedBooking);
//    }

    // Get bookings for a user (borrower)
    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByBorrowerIdOrderByCreatedAtDesc(userId);
        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get bookings for a tool (owner's view)
    public List<BookingResponse> getToolBookings(Long toolId) {
        List<Booking> bookings = bookingRepository.findByItemIdOrderByCreatedAtDesc(toolId);
        return bookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get pending requests for owner (based on their tools)
    public List<BookingResponse> getOwnerPendingRequests(Long ownerId) {
        List<Booking> pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING);

        return pendingBookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Helper method to find alternative dates
    private List<SuggestedDatesResponse> findAlternativeDates(Long itemId, LocalDate startDate, LocalDate endDate) {
        List<SuggestedDatesResponse> suggestions = new ArrayList<>();

        // Get all confirmed bookings for this tool
        List<Booking> confirmedBookings = bookingRepository.findByItemIdAndStatus(itemId, BookingStatus.CONFIRMED);

        // Simple alternative: suggest dates after the last booking
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

    private BookingResponse convertToResponse(Booking booking) {
        // Get item details
        String itemName = "Unknown";
        Long ownerId = null;
        try {
            ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
            itemName = tool.getName();  // ✅ Fixed: using getter
            ownerId = tool.getOwnerId();  // ✅ Fixed: using getter
        } catch (Exception e) {
            logger.warn("Could not fetch tool details for: {}", booking.getItemId());
        }

        // Get borrower details
        String borrowerName = "Unknown";
        try {
            UserDto user = userServiceClient.getUserById(booking.getBorrowerId());
            borrowerName = user.getName();  // ✅ Fixed: using getter
        } catch (Exception e) {
            logger.warn("Could not fetch borrower details for: {}", booking.getBorrowerId());
        }

        // Get owner details
        String ownerName = "Unknown";
        if (ownerId != null) {
            try {
                UserDto owner = userServiceClient.getUserById(ownerId);
                ownerName = owner.getName();  // ✅ Fixed: using getter
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
                .qrCode(booking.getQrCode())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .approvedAt(booking.getApprovedAt())
                .completedAt(booking.getCompletedAt())
                .build();
    }
    // Add this method after getToolBookings() method

    // Get pending bookings for owner (based on their tools)
    public List<BookingResponse> getPendingBookingsForOwner(Long ownerId) {
        // First, get all tools owned by this user from Tool Service
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

        // Extract tool IDs
        List<Long> toolIds = userTools.stream()
                .map(ToolDto::getId)
                .collect(Collectors.toList());

        // Find pending bookings for these tools
        List<Booking> pendingBookings = bookingRepository.findByItemIdInAndStatus(toolIds, BookingStatus.PENDING);

        return pendingBookings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return convertToResponse(booking);
    }
    // Return item - OWNER scans QR code
    @Transactional
    public BookingResponse returnItem(Long bookingId, Long scannerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify the scanner is the OWNER of the tool
        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(scannerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the tool owner can confirm returns");
        }

        // Verify booking is CONFIRMED
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot return booking with status: " + booking.getStatus());
        }

        // Process return
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // Update tool status back to AVAILABLE
        toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");

        logger.info("Item returned for booking: {} by owner: {}", bookingId, scannerId);

        return convertToResponse(savedBooking);
    }

    // Borrower requests return
    @Transactional
    public BookingResponse requestReturn(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user is the borrower
        if (!booking.getBorrowerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only borrower can request return");
        }

        // Can only request return for CONFIRMED bookings
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot request return for booking with status: " + booking.getStatus());
        }

        // Update status to RETURN_REQUESTED
        booking.setStatus(BookingStatus.RETURN_REQUESTED);
        Booking savedBooking = bookingRepository.save(booking);

        logger.info("Return requested for booking: {} by borrower: {}", bookingId, userId);

        return convertToResponse(savedBooking);
    }

    // Owner confirms return after scanning QR
    @Transactional
    public BookingResponse confirmReturn(Long bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user is the tool owner
        ToolDto tool = toolServiceClient.getToolById(booking.getItemId());
        if (!tool.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tool owner can confirm returns");
        }

        // Must be in RETURN_REQUESTED status
        if (booking.getStatus() != BookingStatus.RETURN_REQUESTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot confirm return. Current status: " + booking.getStatus());
        }

        // Process return
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCompletedAt(java.time.LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // Update tool status back to AVAILABLE
        toolServiceClient.updateToolStatus(booking.getItemId(), "AVAILABLE");

        logger.info("Return confirmed for booking: {} by owner: {}", bookingId, ownerId);

        return convertToResponse(savedBooking);
    }

    // Get return requests for owner (bookings with RETURN_REQUESTED status)
    public List<BookingResponse> getReturnRequestsForOwner(Long ownerId) {
        // Get all tools owned by this user
        List<ToolDto> userTools = toolServiceClient.getToolsByOwner(ownerId);

        if (userTools.isEmpty()) {
            return List.of();
        }

        // Get tool IDs
        List<Long> toolIds = userTools.stream()
                .map(ToolDto::getId)
                .collect(Collectors.toList());

        // Find bookings with RETURN_REQUESTED status for these tools
        List<Booking> returnRequests = bookingRepository.findByItemIdInAndStatus(toolIds, BookingStatus.RETURN_REQUESTED);

        return returnRequests.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}