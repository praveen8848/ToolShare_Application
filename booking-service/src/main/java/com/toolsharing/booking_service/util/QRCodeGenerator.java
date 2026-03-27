package com.toolsharing.booking_service.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class QRCodeGenerator {

    @Value("${qr.code.directory:./qr-codes}")
    private String qrCodeDirectory;

    @Value("${qr.code.width:300}")
    private int width;

    @Value("${qr.code.height:300}")
    private int height;

    public String generateQRCode(Long bookingId, Long borrowerId, Long itemId) {
        try {
            // Create directory if not exists
            Path directory = Paths.get(qrCodeDirectory);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            // Create QR code data
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String qrData = String.format("BOOKING:%d:%d:%d:%s", bookingId, borrowerId, itemId, timestamp);

            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrData, BarcodeFormat.QR_CODE, width, height);

            // Save to file
            String fileName = String.format("booking_%d.png", bookingId);
            Path filePath = directory.resolve(fileName);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

            return fileName;

        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }
}