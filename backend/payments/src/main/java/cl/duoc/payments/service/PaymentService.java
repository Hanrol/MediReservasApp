package cl.duoc.payments.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

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
import jakarta.transaction.Transactional;

// IMPORTS PARA LOGS
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final RefundRepository refundRepository;
    private final AppointmentsClient appointmentsClient;
    private final UsersClient usersClient;

    public PaymentService(PaymentRepository paymentRepository, 
                          PaymentReceiptRepository paymentReceiptRepository,
                          RefundRepository refundRepository,
                          AppointmentsClient appointmentsClient,
                          UsersClient usersClient) {
        this.paymentRepository = paymentRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
        this.refundRepository = refundRepository;
        this.appointmentsClient = appointmentsClient;
        this.usersClient = usersClient;
    }

    // --- OBTENER TODOS LOS PAGOS ---
    public List<PaymentDTO> findAllPayments() {
        log.info("Buscando el listado completo de todos los pagos registrados.");
        return paymentRepository.findAll().stream()
                .map(this::convertToPaymentDTO)
                .toList();
    }

    // --- OBTENER PAGO POR ID ---
    public PaymentDTO findPaymentById(Long id) {
        log.info("Buscando pago con ID: {}", id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Error: No se encontró el pago con ID: {}", id);
                    return new RuntimeException("Pago no encontrado");
                });
        return convertToPaymentDTO(payment);
    }

    // --- OBTENER PAGOS POR APPOINTMENT ID ---
    public List<PaymentDTO> findPaymentsByAppointmentId(Long appointmentId) {
        log.info("Buscando pagos asociados a la cita (Appointment ID): {}", appointmentId);
        return paymentRepository.findByAppointmentId(appointmentId).stream()
                .map(this::convertToPaymentDTO)
                .toList();
    }

    // --- OBTENER PAGOS POR PATIENT USER ID ---
    public List<PaymentDTO> findPaymentsByPatientUserId(Long patientUserId) {
        log.info("Buscando pagos asociados al paciente (Patient User ID): {}", patientUserId);
        return paymentRepository.findByPatientUserId(patientUserId).stream()
                .map(this::convertToPaymentDTO)
                .toList();
    }

    // --- OBTENER PAGOS POR ESTADO ---
    public List<PaymentDTO> findPaymentsByStatus(String status) {
        log.info("Filtrando pagos por estado: {}", status);
        return paymentRepository.findByPaymentStatus(status).stream()
                .map(this::convertToPaymentDTO)
                .toList();
    }

    // --- CREAR NUEVO PAGO ---
    @Transactional
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        log.info("Iniciando creación de un nuevo pago para la cita ID: {} por un monto de: {}", 
                paymentDTO.getAppointmentId(), paymentDTO.getAmount());
        
        // Validar que la cita existe
        log.info("Validando existencia de la cita con ID: {}", paymentDTO.getAppointmentId());
        Boolean appointmentExists = appointmentsClient.appointmentIdVerification(paymentDTO.getAppointmentId());
        if (!Boolean.TRUE.equals(appointmentExists)) {
            log.error("Error: La cita con ID: {} no existe", paymentDTO.getAppointmentId());
            throw new RuntimeException("La cita especificada no existe");
        }
        log.info("Cita ID: {} validada correctamente", paymentDTO.getAppointmentId());
        
        // Validar que el paciente existe
        log.info("Validando existencia del paciente con ID: {}", paymentDTO.getPatientUserId());
        Boolean patientExists = usersClient.patientIdVerification(paymentDTO.getPatientUserId());
        if (!Boolean.TRUE.equals(patientExists)) {
            log.error("Error: El paciente con ID: {} no existe", paymentDTO.getPatientUserId());
            throw new RuntimeException("El paciente especificado no existe");
        }
        log.info("Paciente ID: {} validado correctamente", paymentDTO.getPatientUserId());
        
        Payment payment = new Payment();
        payment.setAppointmentId(paymentDTO.getAppointmentId());
        payment.setPatientUserId(paymentDTO.getPatientUserId());
        payment.setAmount(paymentDTO.getAmount());
        payment.setPaymentMethod(paymentDTO.getPaymentMethod());
        payment.setPaymentStatus("PENDING");
        payment.setTransactionCode(generateTransactionCode());
        payment.setCreatedAt(LocalDateTime.now());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Pago creado exitosamente en estado PENDING con ID asignado: {} y código de transacción: {}", 
                savedPayment.getPaymentId(), savedPayment.getTransactionCode());
        return convertToPaymentDTO(savedPayment);
    }

    // --- ACTUALIZAR ESTADO DE PAGO (Ej: COMPLETADO, FALLIDO) ---
    @Transactional
    public PaymentDTO updatePaymentStatus(Long id, String status, String transactionCode) {
        log.info("Solicitando actualización de estado para el pago ID: {}. Nuevo estado: {}", id, status);
        
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Error al actualizar estado: Pago no encontrado con ID: {}", id);
                    return new RuntimeException("Pago no encontrado");
                });
        
        payment.setPaymentStatus(status);
        
        if ("COMPLETED".equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
            log.info("El pago ID: {} ha sido marcado como COMPLETED. Se registra fecha de pago.", id);
        }
        
        if (transactionCode != null && !transactionCode.isEmpty()) {
            log.info("Actualizando código de transacción para el pago ID: {} con valor: {}", id, transactionCode);
            payment.setTransactionCode(transactionCode);
        }
        
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Estado del pago ID: {} actualizado correctamente en base de datos.", id);
        return convertToPaymentDTO(updatedPayment);
    }

    // --- GENERAR COMPROBANTE DE PAGO ---
    @Transactional
    public PaymentReceiptDTO generateReceipt(Long paymentId) {
        log.info("Iniciando generación de comprobante de pago para el registro ID: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> {
                    log.error("Error al generar comprobante: No existe el pago con ID: {}", paymentId);
                    return new RuntimeException("Pago no encontrado");
                });
        
        if (paymentReceiptRepository.findByPayment_PaymentId(paymentId).isPresent()) {
            log.error("Error al generar comprobante: Ya existe una boleta emitida para el pago ID: {}", paymentId);
            throw new RuntimeException("Ya existe un comprobante para este pago");
        }
        
        if (!"COMPLETED".equals(payment.getPaymentStatus())) {
            log.error("Error al generar comprobante: El pago ID: {} se encuentra en estado {}, debe estar COMPLETED", 
                    paymentId, payment.getPaymentStatus());
            throw new RuntimeException("Solo se pueden generar comprobantes para pagos completados");
        }
        
        PaymentReceipt receipt = new PaymentReceipt();
        receipt.setPayment(payment);
        receipt.setReceiptNumber(generateReceiptNumber());
        receipt.setIssuedAt(LocalDateTime.now());
        receipt.setTotalAmount(payment.getAmount());
        
        PaymentReceipt savedReceipt = paymentReceiptRepository.save(receipt);
        log.info("Comprobante generado con éxito. ID: {}, Número de boleta: {}", 
                savedReceipt.getPaymentReceiptId(), savedReceipt.getReceiptNumber());
        return convertToReceiptDTO(savedReceipt);
    }

    // --- OBTENER COMPROBANTE POR ID DE PAGO ---
    public PaymentReceiptDTO getReceiptByPaymentId(Long paymentId) {
        log.info("Buscando comprobante asociado al pago ID: {}", paymentId);
        PaymentReceipt receipt = paymentReceiptRepository.findByPayment_PaymentId(paymentId)
                .orElseThrow(() -> {
                    log.error("Error: No se encontró comprobante para el pago ID: {}", paymentId);
                    return new RuntimeException("Comprobante no encontrado para este pago");
                });
        return convertToReceiptDTO(receipt);
    }

    // --- SOLICITAR REEMBOLSO ---
    @Transactional
    public RefundDTO requestRefund(Long paymentId, BigDecimal refundAmount, String reason) {
        log.warn("Alerta: Se ha iniciado una solicitud de reembolso para el pago ID: {}. Monto solicitado: {}. Motivo: {}", 
                paymentId, refundAmount, reason);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> {
                    log.error("Error en reembolso: No se encontró el pago con ID: {}", paymentId);
                    return new RuntimeException("Pago no encontrado");
                });
        
        if (!"COMPLETED".equals(payment.getPaymentStatus())) {
            log.error("Error en reembolso: El pago ID: {} está en estado {} (Debe estar COMPLETED)", 
                    paymentId, payment.getPaymentStatus());
            throw new RuntimeException("Solo se pueden reembolsar pagos completados");
        }

        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            log.error("Error en reembolso: El monto solicitado ({}) supera el valor original de la transacción ({})", 
                    refundAmount, payment.getAmount());
            throw new RuntimeException("El monto de reembolso no puede exceder el monto del pago");
        }
        
        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setRefundAmount(refundAmount);
        refund.setRefundReason(reason);
        refund.setRefundStatus("PENDING");
        refund.setCreatedAt(LocalDateTime.now());
        
        Refund savedRefund = refundRepository.save(refund);
        
        payment.setPaymentStatus("REFUNDING");
        paymentRepository.save(payment);
        
        log.info("Solicitud de reembolso ID: {} creada con éxito. El pago ID: {} cambió a estado REFUNDING.", 
                savedRefund.getRefundId(), paymentId);
        return convertToRefundDTO(savedRefund);
    }

    // --- ACTUALIZAR ESTADO DE REEMBOLSO ---
    @Transactional
    public RefundDTO updateRefundStatus(Long refundId, String status) {
        log.info("Actualizando estado de la solicitud de reembolso ID: {}. Nuevo estado: {}", refundId, status);
        
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> {
                    log.error("Error al actualizar reembolso: Registro no encontrado con ID: {}", refundId);
                    return new RuntimeException("Reembolso no encontrado");
                });
        
        refund.setRefundStatus(status);
        Refund savedRefund = refundRepository.save(refund);
        
        if ("COMPLETED".equals(status)) {
            Payment payment = refund.getPayment();
            payment.setPaymentStatus("REFUNDED");
            paymentRepository.save(payment);
            log.warn("El reembolso ID: {} se ha completado. El pago ID: {} pasa a estado final REFUNDED.", 
                    refundId, payment.getPaymentId());
        }
        
        log.info("Estado del reembolso ID: {} modificado con éxito.", refundId);
        return convertToRefundDTO(savedRefund);
    }

    // --- OBTENER REEMBOLSOS POR PAGO ---
    public List<RefundDTO> getRefundsByPaymentId(Long paymentId) {
        log.info("Listando todos los reembolsos históricos solicitados para el pago ID: {}", paymentId);
        return refundRepository.findByPayment_PaymentId(paymentId).stream()
                .map(this::convertToRefundDTO)
                .toList();
    }

    // --- ELIMINAR PAGO (Solo si está pendiente) ---
    @Transactional
    public void deletePayment(Long id) {
        log.warn("Intento de eliminación física del registro de pago ID: {}", id);
        
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Error al eliminar: No se encontró el pago con ID: {}", id);
                    return new RuntimeException("Pago no encontrado");
                });
        
        if (!"PENDING".equals(payment.getPaymentStatus())) {
            log.error("Error al eliminar: Cancelado. El pago ID: {} se encuentra en estado {} y no puede borrarse.", 
                    id, payment.getPaymentStatus());
            throw new RuntimeException("Solo se pueden eliminar pagos en estado PENDING");
        }
        
        paymentRepository.delete(payment);
        log.info("El pago ID: {} ha sido eliminado físicamente de la base de datos de manera exitosa.", id);
    }

    // --- MÉTODOS AUXILIARES ---
    
    private String generateTransactionCode() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String generateReceiptNumber() {
        return "RCP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    
    // --- MÉTODOS DE CONVERSIÓN ---
    
    private PaymentDTO convertToPaymentDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setAppointmentId(payment.getAppointmentId());
        dto.setPatientUserId(payment.getPatientUserId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setTransactionCode(payment.getTransactionCode());
        dto.setPaidAt(payment.getPaidAt());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }
    
    private PaymentReceiptDTO convertToReceiptDTO(PaymentReceipt receipt) {
        PaymentReceiptDTO dto = new PaymentReceiptDTO();
        dto.setPaymentReceiptId(receipt.getPaymentReceiptId());
        dto.setPaymentId(receipt.getPayment().getPaymentId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setIssuedAt(receipt.getIssuedAt());
        dto.setTotalAmount(receipt.getTotalAmount());
        return dto;
    }
    
    private RefundDTO convertToRefundDTO(Refund refund) {
        RefundDTO dto = new RefundDTO();
        dto.setRefundId(refund.getRefundId());
        dto.setPaymentId(refund.getPayment().getPaymentId());
        dto.setRefundAmount(refund.getRefundAmount());
        dto.setRefundReason(refund.getRefundReason());
        dto.setRefundStatus(refund.getRefundStatus());
        dto.setCreatedAt(refund.getCreatedAt());
        return dto;
    }
}