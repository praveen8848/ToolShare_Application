package com.toolsharing.booking_service.client;

import java.math.BigDecimal;

public class ToolDto {
    private Long id;
    private String name;
    private String status;
    private Long ownerId;
    private BigDecimal dailyRate;
    private BigDecimal depositAmount;

    public ToolDto() {}

    public ToolDto(Long id, String name, String status, Long ownerId, BigDecimal dailyRate, BigDecimal depositAmount) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.ownerId = ownerId;
        this.dailyRate = dailyRate;
        this.depositAmount = depositAmount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public BigDecimal getDailyRate() { return dailyRate; }
    public void setDailyRate(BigDecimal dailyRate) { this.dailyRate = dailyRate; }

    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
}