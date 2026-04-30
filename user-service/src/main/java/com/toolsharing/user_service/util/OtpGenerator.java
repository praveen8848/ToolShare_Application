package com.toolsharing.user_service.util;

import java.security.SecureRandom;

public class OtpGenerator {
    private static final SecureRandom secureRandom = new SecureRandom();

    public static String generateSixDigitOtp() {
        int number = secureRandom.nextInt(999999);
        return String.format("%06d", number);
    }
}