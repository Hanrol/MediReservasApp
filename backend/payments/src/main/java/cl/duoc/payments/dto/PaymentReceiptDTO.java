package cl.duoc.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentReceiptDTO {
    
    private Long paymentReceiptId;
    private Long paymentId;
    private String receiptNumber;
    private LocalDateTime issuedAt;
    private BigDecimal totalAmount;
}