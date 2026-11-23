package com.toolsharing.auth_service.security;

import com.toolsharing.auth_service.util.SecurityConstants;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter and account lockout tracker for authentication attempts.
 * Prevents brute-force attacks by locking out accounts after repeated failures.
 */
@Component
public class LoginRateLimiter {

    private static class AttemptInfo {
        int attempts;
        LocalDateTime lockoutUntil;

        AttemptInfo(int attempts, LocalDateTime lockoutUntil) {
            this.attempts = attempts;
            this.lockoutUntil = lockoutUntil;
        }
    }

    private final ConcurrentHashMap<String, AttemptInfo> attemptsMap = new ConcurrentHashMap<>();

    /**
     * Checks if the given key (e.g. email or IP) is currently locked out.
     *
     * @param key The identifier (email or IP)
     * @return true if locked out, false otherwise
     */
    public boolean isLocked(String key) {
        if (key == null) return false;
        AttemptInfo info = attemptsMap.get(key.toLowerCase());
        if (info == null) return false;

        if (info.lockoutUntil != null) {
            if (LocalDateTime.now().isBefore(info.lockoutUntil)) {
                return true;
            } else {
                // Lockout expired, reset attempts
                attemptsMap.remove(key.toLowerCase());
                return false;
            }
        }
        return false;
    }

    /**
     * Records a failed login attempt. If attempts exceed threshold, locks the key for LOCKOUT_DURATION_MINUTES.
     *
     * @param key The identifier (email or IP)
     */
    public void recordFailure(String key) {
        if (key == null) return;
        String normalizedKey = key.toLowerCase();

        attemptsMap.compute(normalizedKey, (k, info) -> {
            if (info == null) {
                return new AttemptInfo(1, null);
            }
            int newAttempts = info.attempts + 1;
            LocalDateTime lockout = info.lockoutUntil;
            if (newAttempts >= SecurityConstants.MAX_LOGIN_ATTEMPTS) {
                lockout = LocalDateTime.now().plusMinutes(SecurityConstants.LOCKOUT_DURATION_MINUTES);
            }
            return new AttemptInfo(newAttempts, lockout);
        });
    }

    /**
     * Records a successful login attempt, resetting the failed attempts counter.
     *
     * @param key The identifier (email or IP)
     */
    public void recordSuccess(String key) {
        if (key == null) return;
        attemptsMap.remove(key.toLowerCase());
    }
}
