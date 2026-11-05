package cl.duoc.payments.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
    
    private Long paymentId;
    
    @NotNull(message = "El ID de la cita es obligatorio")
    @Positive(message = "El ID de la cita debe ser un número positivo")
    private Long appointmentId;
    
    @NotNull(message = "El ID del paciente es obligatorio")
    @Positive(message = "El ID del paciente debe ser un número positivo")
    private Long patientUserId;
    
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;
    
    @NotNull(message = "El método de pago es obligatorio")
    @Size(min = 2, max = 50, message = "El método de pago debe tener entre 2 y 50 caracteres")
    private String paymentMethod;
    
    private String paymentStatus;
    private String transactionCode;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}