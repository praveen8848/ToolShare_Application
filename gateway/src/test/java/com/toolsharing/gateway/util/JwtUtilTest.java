package com.toolsharing.gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", SECRET);
    }

    private String createValidToken(String subject, String email, String role, String name) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(subject)
                .claim("email", email)
                .claim("role", role)
                .claim("name", name)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("validateToken should return true for a valid signed token")
    void validateToken_Valid() {
        String token = createValidToken("123", "alice@test.com", "ROLE_USER", "Alice");

        assertTrue(jwtUtil.validateToken(token));
        assertEquals(123L, jwtUtil.getUserIdFromToken(token));
        assertEquals("alice@test.com", jwtUtil.getEmailFromToken(token));
        assertEquals("ROLE_USER", jwtUtil.getRoleFromToken(token));
        assertEquals("Alice", jwtUtil.getNameFromToken(token));
    }

    @Test
    @DisplayName("validateToken should return false for tampered or invalid token")
    void validateToken_Invalid() {
        assertFalse(jwtUtil.validateToken("invalid.token.structure"));
        assertNull(jwtUtil.getUserIdFromToken("invalid.token.structure"));
        assertNull(jwtUtil.getEmailFromToken("invalid.token.structure"));
    }
}
