package cl.duoc.payments.service;

import cl.duoc.payments.client.AppointmentsClient;
import cl.duoc.payments.client.UsersClient;
import cl.duoc.payments.dto.PaymentDTO;
import cl.duoc.payments.dto.PaymentReceiptDTO;
import cl.duoc.payments.dto.RefundDTO;
import cl.duoc.payments.model.Payment;
import cl.duoc.payments.model.PaymentReceipt;
import cl.duoc.payments.model.Refund;
import cl.duoc.payments.repository.PaymentReceiptRepository;
import cl.duoc.payments.repository.PaymentRepository;
import cl.duoc.payments.repository.RefundRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentReceiptRepository paymentReceiptRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private AppointmentsClient appointmentsClient;

    @Mock
    private UsersClient usersClient;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;
    private PaymentDTO paymentDTO;
    private PaymentReceipt paymentReceipt;
    private PaymentReceiptDTO paymentReceiptDTO;
    private Refund refund;
    private RefundDTO refundDTO;
    private List<Payment> paymentList;

    @BeforeEach
    void setUp() {
        // Configurar Payment
        payment = new Payment();
        payment.setPaymentId(1L);
        payment.setAppointmentId(100L);
        payment.setPatientUserId(200L);
        payment.setAmount(new BigDecimal("150.00"));
        payment.setPaymentMethod("CREDIT_CARD");
        payment.setPaymentStatus("PENDING");
        payment.setTransactionCode("TXN-ABC123");
        payment.setCreatedAt(LocalDateTime.now());

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

        // Configurar PaymentReceipt
        paymentReceipt = new PaymentReceipt();
        paymentReceipt.setPaymentReceiptId(1L);
        paymentReceipt.setPayment(payment);
        paymentReceipt.setReceiptNumber("RCP-123456-ABCD");
        paymentReceipt.setIssuedAt(LocalDateTime.now());
        paymentReceipt.setTotalAmount(new BigDecimal("150.00"));

        // Configurar PaymentReceiptDTO
        paymentReceiptDTO = new PaymentReceiptDTO();
        paymentReceiptDTO.setPaymentReceiptId(1L);
        paymentReceiptDTO.setPaymentId(1L);
        paymentReceiptDTO.setReceiptNumber("RCP-123456-ABCD");
        paymentReceiptDTO.setIssuedAt(LocalDateTime.now());
        paymentReceiptDTO.setTotalAmount(new BigDecimal("150.00"));

        // Configurar Refund
        refund = new Refund();
        refund.setRefundId(1L);
        refund.setPayment(payment);
        refund.setRefundAmount(new BigDecimal("150.00"));
        refund.setRefundReason("Cancelación de servicio");
        refund.setRefundStatus("PENDING");
        refund.setCreatedAt(LocalDateTime.now());

        // Configurar RefundDTO
        refundDTO = new RefundDTO();
        refundDTO.setRefundId(1L);
        refundDTO.setPaymentId(1L);
        refundDTO.setRefundAmount(new BigDecimal("150.00"));
        refundDTO.setRefundReason("Cancelación de servicio");
        refundDTO.setRefundStatus("PENDING");
        refundDTO.setCreatedAt(LocalDateTime.now());

        // Configurar lista de pagos
        paymentList = Arrays.asList(payment);
    }

    // ==================== TESTS FIND ALL ====================

    @Test
    void findAllPayments_ShouldReturnListOfPayments() {
        when(paymentRepository.findAll()).thenReturn(paymentList);

        List<PaymentDTO> result = paymentService.findAllPayments();

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPaymentId()).isEqualTo(1L);
        assertThat(result.get(0).getAppointmentId()).isEqualTo(100L);
        assertThat(result.get(0).getAmount()).isEqualTo(new BigDecimal("150.00"));
        verify(paymentRepository, times(1)).findAll();
    }

    @Test
    void findAllPayments_WhenNoPayments_ShouldReturnEmptyList() {
        when(paymentRepository.findAll()).thenReturn(Arrays.asList());

        List<PaymentDTO> result = paymentService.findAllPayments();

        assertThat(result).isEmpty();
        verify(paymentRepository, times(1)).findAll();
    }

    // ==================== TESTS FIND BY ID ====================

    @Test
    void findPaymentById_ShouldReturnPayment() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        PaymentDTO result = paymentService.findPaymentById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentId()).isEqualTo(1L);
        assertThat(result.getAppointmentId()).isEqualTo(100L);
        assertThat(result.getPatientUserId()).isEqualTo(200L);
        assertThat(result.getAmount()).isEqualTo(new BigDecimal("150.00"));
        verify(paymentRepository, times(1)).findById(1L);
    }

    @Test
    void findPaymentById_WhenPaymentNotFound_ShouldThrowException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.findPaymentById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pago no encontrado");
        verify(paymentRepository, times(1)).findById(999L);
    }

    // ==================== TESTS FIND BY APPOINTMENT ID ====================

    @Test
    void findPaymentsByAppointmentId_ShouldReturnPayments() {
        when(paymentRepository.findByAppointmentId(100L)).thenReturn(paymentList);

        List<PaymentDTO> result = paymentService.findPaymentsByAppointmentId(100L);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAppointmentId()).isEqualTo(100L);
        verify(paymentRepository, times(1)).findByAppointmentId(100L);
    }

    @Test
    void findPaymentsByAppointmentId_WhenNoPayments_ShouldReturnEmptyList() {
        when(paymentRepository.findByAppointmentId(999L)).thenReturn(Arrays.asList());

        List<PaymentDTO> result = paymentService.findPaymentsByAppointmentId(999L);

        assertThat(result).isEmpty();
        verify(paymentRepository, times(1)).findByAppointmentId(999L);
    }

    // ==================== TESTS FIND BY PATIENT USER ID ====================

    @Test
    void findPaymentsByPatientUserId_ShouldReturnPayments() {
        when(paymentRepository.findByPatientUserId(200L)).thenReturn(paymentList);

        List<PaymentDTO> result = paymentService.findPaymentsByPatientUserId(200L);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPatientUserId()).isEqualTo(200L);
        verify(paymentRepository, times(1)).findByPatientUserId(200L);
    }

    @Test
    void findPaymentsByPatientUserId_WhenNoPayments_ShouldReturnEmptyList() {
        when(paymentRepository.findByPatientUserId(999L)).thenReturn(Arrays.asList());

        List<PaymentDTO> result = paymentService.findPaymentsByPatientUserId(999L);

        assertThat(result).isEmpty();
        verify(paymentRepository, times(1)).findByPatientUserId(999L);
    }

    // ==================== TESTS FIND BY STATUS ====================

    @Test
    void findPaymentsByStatus_ShouldReturnPayments() {
        when(paymentRepository.findByPaymentStatus("PENDING")).thenReturn(paymentList);

        List<PaymentDTO> result = paymentService.findPaymentsByStatus("PENDING");

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPaymentStatus()).isEqualTo("PENDING");
        verify(paymentRepository, times(1)).findByPaymentStatus("PENDING");
    }

    @Test
    void findPaymentsByStatus_WhenNoPayments_ShouldReturnEmptyList() {
        when(paymentRepository.findByPaymentStatus("COMPLETED")).thenReturn(Arrays.asList());

        List<PaymentDTO> result = paymentService.findPaymentsByStatus("COMPLETED");

        assertThat(result).isEmpty();
        verify(paymentRepository, times(1)).findByPaymentStatus("COMPLETED");
    }

    // ==================== TESTS CREATE PAYMENT ====================

    @Test
    void createPayment_ShouldReturnCreatedPayment() {
        when(appointmentsClient.appointmentIdVerification(100L)).thenReturn(true);
        when(usersClient.patientIdVerification(200L)).thenReturn(true);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        PaymentDTO result = paymentService.createPayment(paymentDTO);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentId()).isEqualTo(1L);
        assertThat(result.getAppointmentId()).isEqualTo(100L);
        assertThat(result.getPaymentStatus()).isEqualTo("PENDING");
        assertThat(result.getTransactionCode()).startsWith("TXN-");
        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(appointmentsClient, times(1)).appointmentIdVerification(100L);
        verify(usersClient, times(1)).patientIdVerification(200L);
    }

    @Test
    void createPayment_WhenAppointmentNotExists_ShouldThrowException() {
        when(appointmentsClient.appointmentIdVerification(100L)).thenReturn(false);

        assertThatThrownBy(() -> paymentService.createPayment(paymentDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("La cita especificada no existe");
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(appointmentsClient, times(1)).appointmentIdVerification(100L);
        verify(usersClient, never()).patientIdVerification(anyLong());
    }

    @Test
    void createPayment_WhenPatientNotExists_ShouldThrowException() {
        when(appointmentsClient.appointmentIdVerification(100L)).thenReturn(true);
        when(usersClient.patientIdVerification(200L)).thenReturn(false);

        assertThatThrownBy(() -> paymentService.createPayment(paymentDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El paciente especificado no existe");
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(appointmentsClient, times(1)).appointmentIdVerification(100L);
        verify(usersClient, times(1)).patientIdVerification(200L);
    }

    @Test
    void createPayment_WhenAppointmentClientThrowsException_ShouldPropagate() {
        when(appointmentsClient.appointmentIdVerification(100L))
                .thenThrow(new RuntimeException("Error al verificar la cita"));

        assertThatThrownBy(() -> paymentService.createPayment(paymentDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Error al verificar la cita");
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(usersClient, never()).patientIdVerification(anyLong());
    }

    // ==================== TESTS UPDATE PAYMENT STATUS ====================

    @Test
    void updatePaymentStatus_ToCompleted_ShouldSetPaidAt() {
        Payment paymentToUpdate = new Payment();
        paymentToUpdate.setPaymentId(1L);
        paymentToUpdate.setPaymentStatus("PENDING");
        paymentToUpdate.setAppointmentId(100L);
        paymentToUpdate.setPatientUserId(200L);
        paymentToUpdate.setAmount(new BigDecimal("150.00"));
        paymentToUpdate.setPaymentMethod("CREDIT_CARD");
        paymentToUpdate.setTransactionCode("TXN-ABC123");
        paymentToUpdate.setCreatedAt(LocalDateTime.now());

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(paymentToUpdate));
        when(paymentRepository.save(any(Payment.class))).thenReturn(paymentToUpdate);

        PaymentDTO result = paymentService.updatePaymentStatus(1L, "COMPLETED", "TXN-COMPLETED");

        assertThat(result).isNotNull();
        assertThat(result.getPaymentStatus()).isEqualTo("COMPLETED");
        assertThat(result.getTransactionCode()).isEqualTo("TXN-COMPLETED");
        assertThat(result.getPaidAt()).isNotNull();
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void updatePaymentStatus_ToFailed_ShouldNotSetPaidAt() {
        Payment paymentToUpdate = new Payment();
        paymentToUpdate.setPaymentId(1L);
        paymentToUpdate.setPaymentStatus("PENDING");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(paymentToUpdate));
        when(paymentRepository.save(any(Payment.class))).thenReturn(paymentToUpdate);

        PaymentDTO result = paymentService.updatePaymentStatus(1L, "FAILED", null);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentStatus()).isEqualTo("FAILED");
        assertThat(result.getPaidAt()).isNull();
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void updatePaymentStatus_WhenPaymentNotFound_ShouldThrowException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.updatePaymentStatus(999L, "COMPLETED", "TXN-123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pago no encontrado");
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    // ==================== TESTS GENERATE RECEIPT ====================

    @Test
    void generateReceipt_ShouldReturnCreatedReceipt() {
        Payment completedPayment = new Payment();
        completedPayment.setPaymentId(1L);
        completedPayment.setPaymentStatus("COMPLETED");
        completedPayment.setAppointmentId(100L);
        completedPayment.setPatientUserId(200L);
        completedPayment.setAmount(new BigDecimal("150.00"));
        completedPayment.setPaymentMethod("CREDIT_CARD");
        completedPayment.setTransactionCode("TXN-ABC123");
        completedPayment.setCreatedAt(LocalDateTime.now());
        completedPayment.setPaidAt(LocalDateTime.now());

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(completedPayment));
        when(paymentReceiptRepository.findByPayment_PaymentId(1L)).thenReturn(Optional.empty());
        when(paymentReceiptRepository.save(any(PaymentReceipt.class))).thenReturn(paymentReceipt);

        PaymentReceiptDTO result = paymentService.generateReceipt(1L);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentReceiptId()).isEqualTo(1L);
        assertThat(result.getPaymentId()).isEqualTo(1L);
        assertThat(result.getReceiptNumber()).startsWith("RCP-");
        assertThat(result.getTotalAmount()).isEqualTo(new BigDecimal("150.00"));
        verify(paymentReceiptRepository, times(1)).save(any(PaymentReceipt.class));
    }

    @Test
    void generateReceipt_WhenPaymentNotCompleted_ShouldThrowException() {
        Payment pendingPayment = new Payment();
        pendingPayment.setPaymentId(1L);
        pendingPayment.setPaymentStatus("PENDING");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.generateReceipt(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Solo se pueden generar comprobantes para pagos completados");
        verify(paymentReceiptRepository, never()).save(any(PaymentReceipt.class));
    }

    @Test
    void generateReceipt_WhenReceiptAlreadyExists_ShouldThrowException() {
        Payment completedPayment = new Payment();
        completedPayment.setPaymentId(1L);
        completedPayment.setPaymentStatus("COMPLETED");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(completedPayment));
        when(paymentReceiptRepository.findByPayment_PaymentId(1L)).thenReturn(Optional.of(paymentReceipt));

        assertThatThrownBy(() -> paymentService.generateReceipt(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Ya existe un comprobante para este pago");
        verify(paymentReceiptRepository, never()).save(any(PaymentReceipt.class));
    }

    @Test
    void generateReceipt_WhenPaymentNotFound_ShouldThrowException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.generateReceipt(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pago no encontrado");
        verify(paymentReceiptRepository, never()).save(any(PaymentReceipt.class));
    }

    // ==================== TESTS GET RECEIPT ====================

    @Test
    void getReceiptByPaymentId_ShouldReturnReceipt() {
        when(paymentReceiptRepository.findByPayment_PaymentId(1L)).thenReturn(Optional.of(paymentReceipt));

        PaymentReceiptDTO result = paymentService.getReceiptByPaymentId(1L);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentReceiptId()).isEqualTo(1L);
        assertThat(result.getPaymentId()).isEqualTo(1L);
        assertThat(result.getReceiptNumber()).isEqualTo("RCP-123456-ABCD");
        verify(paymentReceiptRepository, times(1)).findByPayment_PaymentId(1L);
    }

    @Test
    void getReceiptByPaymentId_WhenReceiptNotFound_ShouldThrowException() {
        when(paymentReceiptRepository.findByPayment_PaymentId(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.getReceiptByPaymentId(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Comprobante no encontrado para este pago");
    }

    // ==================== TESTS REQUEST REFUND ====================

    @Test
    void requestRefund_ShouldReturnCreatedRefund() {
        Payment completedPayment = new Payment();
        completedPayment.setPaymentId(1L);
        completedPayment.setPaymentStatus("COMPLETED");
        completedPayment.setAmount(new BigDecimal("150.00"));

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(completedPayment));
        when(refundRepository.save(any(Refund.class))).thenReturn(refund);
        when(paymentRepository.save(any(Payment.class))).thenReturn(completedPayment);

        RefundDTO result = paymentService.requestRefund(1L, new BigDecimal("150.00"), "Cancelación de servicio");

        assertThat(result).isNotNull();
        assertThat(result.getRefundId()).isEqualTo(1L);
        assertThat(result.getPaymentId()).isEqualTo(1L);
        assertThat(result.getRefundAmount()).isEqualTo(new BigDecimal("150.00"));
        assertThat(result.getRefundStatus()).isEqualTo("PENDING");
        verify(refundRepository, times(1)).save(any(Refund.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void requestRefund_WhenPaymentNotCompleted_ShouldThrowException() {
        Payment pendingPayment = new Payment();
        pendingPayment.setPaymentId(1L);
        pendingPayment.setPaymentStatus("PENDING");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.requestRefund(1L, new BigDecimal("100.00"), "Motivo"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Solo se pueden reembolsar pagos completados");
        verify(refundRepository, never()).save(any(Refund.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void requestRefund_WhenAmountExceedsPayment_ShouldThrowException() {
        Payment completedPayment = new Payment();
        completedPayment.setPaymentId(1L);
        completedPayment.setPaymentStatus("COMPLETED");
        completedPayment.setAmount(new BigDecimal("150.00"));

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(completedPayment));

        assertThatThrownBy(() -> paymentService.requestRefund(1L, new BigDecimal("200.00"), "Motivo"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El monto de reembolso no puede exceder el monto del pago");
        verify(refundRepository, never()).save(any(Refund.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void requestRefund_WhenPaymentNotFound_ShouldThrowException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.requestRefund(999L, new BigDecimal("100.00"), "Motivo"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pago no encontrado");
        verify(refundRepository, never()).save(any(Refund.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    // ==================== TESTS UPDATE REFUND STATUS ====================

    @Test
    void updateRefundStatus_ToCompleted_ShouldUpdatePaymentStatusToRefunded() {
        Refund refundToUpdate = new Refund();
        refundToUpdate.setRefundId(1L);
        refundToUpdate.setRefundStatus("PENDING");
        refundToUpdate.setPayment(payment);
        refundToUpdate.setRefundAmount(new BigDecimal("150.00"));

        when(refundRepository.findById(1L)).thenReturn(Optional.of(refundToUpdate));
        when(refundRepository.save(any(Refund.class))).thenReturn(refundToUpdate);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        RefundDTO result = paymentService.updateRefundStatus(1L, "COMPLETED");

        assertThat(result).isNotNull();
        assertThat(result.getRefundStatus()).isEqualTo("COMPLETED");
        verify(refundRepository, times(1)).save(any(Refund.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void updateRefundStatus_ToRejected_ShouldNotUpdatePayment() {
        Refund refundToUpdate = new Refund();
        refundToUpdate.setRefundId(1L);
        refundToUpdate.setRefundStatus("PENDING");
        refundToUpdate.setPayment(payment);

        when(refundRepository.findById(1L)).thenReturn(Optional.of(refundToUpdate));
        when(refundRepository.save(any(Refund.class))).thenReturn(refundToUpdate);

        RefundDTO result = paymentService.updateRefundStatus(1L, "REJECTED");

        assertThat(result).isNotNull();
        assertThat(result.getRefundStatus()).isEqualTo("REJECTED");
        verify(refundRepository, times(1)).save(any(Refund.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void updateRefundStatus_WhenRefundNotFound_ShouldThrowException() {
        when(refundRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.updateRefundStatus(999L, "COMPLETED"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Reembolso no encontrado");
        verify(refundRepository, never()).save(any(Refund.class));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    // ==================== TESTS GET REFUNDS BY PAYMENT ID ====================

    @Test
    void getRefundsByPaymentId_ShouldReturnListOfRefunds() {
        List<Refund> refundList = Arrays.asList(refund);
        when(refundRepository.findByPayment_PaymentId(1L)).thenReturn(refundList);

        List<RefundDTO> result = paymentService.getRefundsByPaymentId(1L);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRefundId()).isEqualTo(1L);
        assertThat(result.get(0).getPaymentId()).isEqualTo(1L);
        verify(refundRepository, times(1)).findByPayment_PaymentId(1L);
    }

    @Test
    void getRefundsByPaymentId_WhenNoRefunds_ShouldReturnEmptyList() {
        when(refundRepository.findByPayment_PaymentId(999L)).thenReturn(Arrays.asList());

        List<RefundDTO> result = paymentService.getRefundsByPaymentId(999L);

        assertThat(result).isEmpty();
        verify(refundRepository, times(1)).findByPayment_PaymentId(999L);
    }

    // ==================== TESTS DELETE PAYMENT ====================

    @Test
    void deletePayment_WhenPending_ShouldDelete() {
        Payment pendingPayment = new Payment();
        pendingPayment.setPaymentId(1L);
        pendingPayment.setPaymentStatus("PENDING");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(pendingPayment));
        doNothing().when(paymentRepository).delete(pendingPayment);

        paymentService.deletePayment(1L);

        verify(paymentRepository, times(1)).delete(pendingPayment);
    }

    @Test
    void deletePayment_WhenNotPending_ShouldThrowException() {
        Payment completedPayment = new Payment();
        completedPayment.setPaymentId(1L);
        completedPayment.setPaymentStatus("COMPLETED");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(completedPayment));

        assertThatThrownBy(() -> paymentService.deletePayment(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Solo se pueden eliminar pagos en estado PENDING");
        verify(paymentRepository, never()).delete(any(Payment.class));
    }

    @Test
    void deletePayment_WhenPaymentNotFound_ShouldThrowException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.deletePayment(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pago no encontrado");
        verify(paymentRepository, never()).delete(any(Payment.class));
    }
}