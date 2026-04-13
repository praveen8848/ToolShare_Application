package com.toolsharing.notification_service.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String eventType;       // e.g., "BOOKING_APPROVED", "RETURN_REQUESTED"
    private String recipientEmail;  // Who gets the email
    private String subject;         // Email subject line
    private String messageBody;     // The actual email content
}