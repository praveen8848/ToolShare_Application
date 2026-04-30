package com.toolsharing.user_service.repository;

import com.toolsharing.user_service.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE UserProfile u SET u.lastActive = CURRENT_TIMESTAMP WHERE u.userId = :userId")
    void updateLastActive(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserProfile u SET u.trustScore = :score WHERE u.userId = :userId")
    void updateTrustScore(@Param("userId") Long userId, @Param("score") Double score);

//    @Modifying
//    @Transactional
//    @Query("UPDATE UserProfile u SET u.successfulTransactions = u.successfulTransactions + 1 WHERE u.userId = :userId")
//    void incrementSuccessfulTransactions(@Param("userId") Long userId);
//
//    @Modifying
//    @Transactional
//    @Query("UPDATE UserProfile u SET u.cancelledTransactions = u.cancelledTransactions + 1 WHERE u.userId = :userId")
//    void incrementCancelledTransactions(@Param("userId") Long userId);
}