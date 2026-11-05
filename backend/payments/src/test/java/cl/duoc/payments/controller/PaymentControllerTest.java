package cl.duoc.payments.controller;

import cl.duoc.payments.dto.PaymentDTO;
import cl.duoc.payments.dto.PaymentReceiptDTO;
import cl.duoc.payments.dto.RefundDTO;
import cl.duoc.payments.exception.GlobalExceptionHandler;
import cl.duoc.payments.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private ObjectMapper objectMapper;
    private PaymentDTO paymentDTO;
    private PaymentReceiptDTO paymentReceiptDTO;
    private RefundDTO refundDTO;
    private List<PaymentDTO> paymentList;

    @BeforeEach
    void setUp() {
        // Configurar ObjectMapper con soporte para Java Time
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Configurar MockMvc con el controlador y el GlobalExceptionHandler
        mockMvc = MockMvcBuilders
                .standaloneSetup(paymentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        // Configurar PaymentDTO
        paymentDTO = new PaymentDTO();
        paymentDTO.setPaymentId(1L);
        paymentDTO.setAppointmentId(100L);
        paymentDTO.setPatientUserId(200L);
        paymentDTO.setAmount(new BigDecimal("150.00"));
        paymentDTO.setPaymentMethod("CREDIT_CARD");
        paymentDTO.setPaymentStatus("PENDING");
        paymentDTO.setTransactionCode("TXN-ABC123");
        paymentDTO.setCreatedAt(LocalDateTime.now());

        // Configurar PaymentReceiptDTO
        paymentReceiptDTO = new PaymentReceiptDTO();
        paymentReceiptDTO.setPaymentReceiptId(1L);
        paymentReceiptDTO.setPaymentId(1L);
        paymentReceiptDTO.setReceiptNumber("RCP-123456-ABCD");
        paymentReceiptDTO.setIssuedAt(LocalDateTime.now());
        paymentReceiptDTO.setTotalAmount(new BigDecimal("150.00"));

        // Configurar RefundDTO
        refundDTO = new RefundDTO();
        refundDTO.setRefundId(1L);
        refundDTO.setPaymentId(1L);
        refundDTO.setRefundAmount(new BigDecimal("150.00"));
        refundDTO.setRefundReason("Cancelación de servicio");
        refundDTO.setRefundStatus("PENDING");
        refundDTO.setCreatedAt(LocalDateTime.now());

        // Configurar lista de pagos
        paymentList = Arrays.asList(paymentDTO);
    }

    // ==================== TESTS GET ====================

    @Test
    void getAllPayments_ShouldReturnListOfPayments() throws Exception {
        when(paymentService.findAllPayments()).thenReturn(paymentList);

        mockMvc.perform(get("/api/payments")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentId").value(1L))
                .andExpect(jsonPath("$[0].appointmentId").value(100L))
                .andExpect(jsonPath("$[0].amount").value(150.00))
                .andExpect(jsonPath("$[0].paymentStatus").value("PENDING"));
    }

    @Test
    void getPaymentById_ShouldReturnPayment() throws Exception {
        when(paymentService.findPaymentById(1L)).thenReturn(paymentDTO);

        mockMvc.perform(get("/api/payments/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.appointmentId").value(100L))
                .andExpect(jsonPath("$.patientUserId").value(200L))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.paymentMethod").value("CREDIT_CARD"));
    }

    @Test
    void getPaymentsByAppointmentId_ShouldReturnPayments() throws Exception {
        when(paymentService.findPaymentsByAppointmentId(100L)).thenReturn(paymentList);

        mockMvc.perform(get("/api/payments/appointment/{appointmentId}", 100L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].appointmentId").value(100L));
    }

    @Test
    void getPaymentsByPatientUserId_ShouldReturnPayments() throws Exception {
        when(paymentService.findPaymentsByPatientUserId(200L)).thenReturn(paymentList);

        mockMvc.perform(get("/api/payments/patient/{patientUserId}", 200L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].patientUserId").value(200L));
    }

    @Test
    void getPaymentsByStatus_ShouldReturnPayments() throws Exception {
        when(paymentService.findPaymentsByStatus("PENDING")).thenReturn(paymentList);

        mockMvc.perform(get("/api/payments/status")
                .param("status", "PENDING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentStatus").value("PENDING"));
    }

    // ==================== TESTS POST ====================

    @Test
    void createPayment_ShouldReturnCreatedPayment() throws Exception {
        PaymentDTO newPaymentDTO = new PaymentDTO();
        newPaymentDTO.setAppointmentId(100L);
        newPaymentDTO.setPatientUserId(200L);
        newPaymentDTO.setAmount(new BigDecimal("150.00"));
        newPaymentDTO.setPaymentMethod("CREDIT_CARD");

        when(paymentService.createPayment(any(PaymentDTO.class))).thenReturn(paymentDTO);

        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPaymentDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.appointmentId").value(100L))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"));
    }

    @Test
    void createPayment_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Datos inválidos - campo requerido null
        PaymentDTO invalidPaymentDTO = new PaymentDTO();
        invalidPaymentDTO.setAppointmentId(null);  // @NotNull
        invalidPaymentDTO.setPatientUserId(200L);
        invalidPaymentDTO.setAmount(new BigDecimal("-10.00"));  // @DecimalMin falla
        invalidPaymentDTO.setPaymentMethod("");  // @Size falla

        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPaymentDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPayment_WithMissingRequiredFields_ShouldReturnBadRequest() throws Exception {
        // Objeto vacío - todos los campos requeridos faltan
        PaymentDTO emptyDTO = new PaymentDTO();

        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPayment_WithNegativeAmount_ShouldReturnBadRequest() throws Exception {
        PaymentDTO negativeAmountDTO = new PaymentDTO();
        negativeAmountDTO.setAppointmentId(100L);
        negativeAmountDTO.setPatientUserId(200L);
        negativeAmountDTO.setAmount(new BigDecimal("-50.00"));  // Monto negativo
        negativeAmountDTO.setPaymentMethod("CREDIT_CARD");

        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(negativeAmountDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPayment_WithZeroAmount_ShouldReturnBadRequest() throws Exception {
        PaymentDTO zeroAmountDTO = new PaymentDTO();
        zeroAmountDTO.setAppointmentId(100L);
        zeroAmountDTO.setPatientUserId(200L);
        zeroAmountDTO.setAmount(BigDecimal.ZERO);  // Monto cero
        zeroAmountDTO.setPaymentMethod("CREDIT_CARD");

        mockMvc.perform(post("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(zeroAmountDTO)))
                .andExpect(status().isBadRequest());
    }

    // ==================== TESTS PUT ====================

    @Test
    void updatePaymentStatus_ShouldReturnUpdatedPayment() throws Exception {
        PaymentDTO updatedPaymentDTO = new PaymentDTO();
        updatedPaymentDTO.setPaymentId(1L);
        updatedPaymentDTO.setAppointmentId(100L);
        updatedPaymentDTO.setPatientUserId(200L);
        updatedPaymentDTO.setAmount(new BigDecimal("150.00"));
        updatedPaymentDTO.setPaymentMethod("CREDIT_CARD");
        updatedPaymentDTO.setPaymentStatus("COMPLETED");
        updatedPaymentDTO.setTransactionCode("TXN-COMPLETED");
        updatedPaymentDTO.setPaidAt(LocalDateTime.now());
        updatedPaymentDTO.setCreatedAt(LocalDateTime.now());

        when(paymentService.updatePaymentStatus(eq(1L), eq("COMPLETED"), eq("TXN-COMPLETED")))
                .thenReturn(updatedPaymentDTO);

        mockMvc.perform(put("/api/payments/{id}/status", 1L)
                .param("status", "COMPLETED")
                .param("transactionCode", "TXN-COMPLETED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.paymentStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.transactionCode").value("TXN-COMPLETED"));
    }

    // ==================== TESTS DELETE ====================

    @Test
    void deletePayment_ShouldReturnNoContent() throws Exception {
        doNothing().when(paymentService).deletePayment(1L);

        mockMvc.perform(delete("/api/payments/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    // ==================== TESTS RECEIPTS ====================

    @Test
    void generateReceipt_ShouldReturnCreatedReceipt() throws Exception {
        when(paymentService.generateReceipt(1L)).thenReturn(paymentReceiptDTO);

        mockMvc.perform(post("/api/payments/{paymentId}/receipt", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentReceiptId").value(1L))
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.receiptNumber").value("RCP-123456-ABCD"))
                .andExpect(jsonPath("$.totalAmount").value(150.00));
    }

    @Test
    void getReceiptByPaymentId_ShouldReturnReceipt() throws Exception {
        when(paymentService.getReceiptByPaymentId(1L)).thenReturn(paymentReceiptDTO);

        mockMvc.perform(get("/api/payments/{paymentId}/receipt", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentReceiptId").value(1L))
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.receiptNumber").value("RCP-123456-ABCD"));
    }

    // ==================== TESTS REFUNDS ====================

    @Test
    void requestRefund_ShouldReturnCreatedRefund() throws Exception {
        when(paymentService.requestRefund(eq(1L), eq(new BigDecimal("150.00")), eq("Cancelación de servicio")))
                .thenReturn(refundDTO);

        mockMvc.perform(post("/api/payments/{paymentId}/refund", 1L)
                .param("amount", "150.00")
                .param("reason", "Cancelación de servicio")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.refundId").value(1L))
                .andExpect(jsonPath("$.paymentId").value(1L))
                .andExpect(jsonPath("$.refundAmount").value(150.00))
                .andExpect(jsonPath("$.refundReason").value("Cancelación de servicio"))
                .andExpect(jsonPath("$.refundStatus").value("PENDING"));
    }

    @Test
    void updateRefundStatus_ShouldReturnUpdatedRefund() throws Exception {
        RefundDTO updatedRefundDTO = new RefundDTO();
        updatedRefundDTO.setRefundId(1L);
        updatedRefundDTO.setPaymentId(1L);
        updatedRefundDTO.setRefundAmount(new BigDecimal("150.00"));
        updatedRefundDTO.setRefundReason("Cancelación de servicio");
        updatedRefundDTO.setRefundStatus("APPROVED");
        updatedRefundDTO.setCreatedAt(LocalDateTime.now());

        when(paymentService.updateRefundStatus(eq(1L), eq("APPROVED")))
                .thenReturn(updatedRefundDTO);

        mockMvc.perform(put("/api/payments/refund/{refundId}/status", 1L)
                .param("status", "APPROVED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refundId").value(1L))
                .andExpect(jsonPath("$.refundStatus").value("APPROVED"));
    }

    @Test
    void getRefundsByPaymentId_ShouldReturnListOfRefunds() throws Exception {
        List<RefundDTO> refundList = Arrays.asList(refundDTO);
        when(paymentService.getRefundsByPaymentId(1L)).thenReturn(refundList);

        mockMvc.perform(get("/api/payments/{paymentId}/refunds", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].refundId").value(1L))
                .andExpect(jsonPath("$[0].paymentId").value(1L))
                .andExpect(jsonPath("$[0].refundAmount").value(150.00));
    }
}