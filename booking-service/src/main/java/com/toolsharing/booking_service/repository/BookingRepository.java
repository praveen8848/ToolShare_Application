package com.toolsharing.booking_service.repository;

import com.toolsharing.booking_service.entity.Booking;
import com.toolsharing.booking_service.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by borrower
    List<Booking> findByBorrowerIdOrderByCreatedAtDesc(Long borrowerId);

    // Find bookings by item (for owner)
    List<Booking> findByItemIdOrderByCreatedAtDesc(Long itemId);

    // Find pending bookings for an item
    List<Booking> findByItemIdAndStatus(Long itemId, BookingStatus status);

    // Find confirmed bookings that overlap with given dates
    @Query("SELECT b FROM Booking b WHERE " +
            "b.itemId = :itemId AND " +
            "b.status = 'CONFIRMED' AND " +
            "((b.startDate <= :endDate AND b.endDate >= :startDate))")
    List<Booking> findConfirmedOverlappingBookings(
            @Param("itemId") Long itemId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find all pending bookings for an item
    @Query("SELECT b FROM Booking b WHERE b.itemId = :itemId AND b.status = 'PENDING'")
    List<Booking> findPendingBookingsByItem(@Param("itemId") Long itemId);

    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find bookings by item IDs (for owner's pending requests)
    @Query("SELECT b FROM Booking b WHERE b.itemId IN :itemIds AND b.status = 'PENDING' ORDER BY b.createdAt DESC")
    List<Booking> findByItemIdInAndStatus(@Param("itemIds") List<Long> itemIds, @Param("status") BookingStatus status);

    // Find pending bookings for a borrower
    List<Booking> findByBorrowerIdAndStatus(Long borrowerId, BookingStatus status);

    // Find confirmed booking for specific item and dates (exists check)
    boolean existsByItemIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long itemId, BookingStatus status, LocalDate endDate, LocalDate startDate);
}