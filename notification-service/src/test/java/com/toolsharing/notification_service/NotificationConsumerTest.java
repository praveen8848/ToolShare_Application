package com.toolsharing.notification_service;

import com.toolsharing.notification_service.consumer.NotificationConsumer;
import com.toolsharing.notification_service.dto.NotificationEvent;
import com.toolsharing.notification_service.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Test
    @DisplayName("consumeNotification should forward details to EmailService")
    void consumeNotification_Success() {
        NotificationEvent event = NotificationEvent.builder()
                .recipientEmail("user@example.com")
                .subject("Booking Request")
                .messageBody("Your tool has been requested")
                .eventType("BOOKING_REQUESTED")
                .build();

        notificationConsumer.consumeNotification(event);

        verify(emailService).sendEmail("user@example.com", "Booking Request", "Your tool has been requested");
    }
}
