package com.toolsharing.notification_service.consumer;

import com.toolsharing.notification_service.config.RabbitMQConfig;
import com.toolsharing.notification_service.dto.NotificationEvent;
import com.toolsharing.notification_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumeNotification(NotificationEvent event) {
        logger.info("Received message from queue! Event Type: {}", event.getEventType());

        // Trigger the email service
        emailService.sendEmail(
                event.getRecipientEmail(),
                event.getSubject(),
                event.getMessageBody()
        );
    }
}