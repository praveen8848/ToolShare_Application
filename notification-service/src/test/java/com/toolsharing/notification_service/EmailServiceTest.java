package com.toolsharing.notification_service;

import com.toolsharing.notification_service.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@toolsharing.com");
    }

    @Test
    @DisplayName("sendEmail should construct SimpleMailMessage and call mailSender.send")
    void sendEmail_Success() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        emailService.sendEmail("recipient@example.com", "Test Subject", "Test Body");

        verify(mailSender).send(captor.capture());
        SimpleMailMessage capturedMessage = captor.getValue();
        assertEquals("noreply@toolsharing.com", capturedMessage.getFrom());
        assertArrayEquals(new String[]{"recipient@example.com"}, capturedMessage.getTo());
        assertEquals("Test Subject", capturedMessage.getSubject());
        assertEquals("Test Body", capturedMessage.getText());
    }

    @Test
    @DisplayName("sendEmail should throw RuntimeException when mailSender fails")
    void sendEmail_Failure() {
        doThrow(new RuntimeException("Connection refused")).when(mailSender).send(any(SimpleMailMessage.class));

        assertThrows(RuntimeException.class, () ->
                emailService.sendEmail("recipient@example.com", "Test Subject", "Test Body")
        );
    }
}
