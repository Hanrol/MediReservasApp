package cl.duoc.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefundDTO {
    
    private Long refundId;
    private Long paymentId;
    private BigDecimal refundAmount;
    private String refundReason;
    private String refundStatus;
    private LocalDateTime createdAt;
}