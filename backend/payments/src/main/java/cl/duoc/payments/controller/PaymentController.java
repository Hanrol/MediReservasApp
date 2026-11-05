package cl.duoc.payments.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.payments.dto.PaymentDTO;
import cl.duoc.payments.dto.PaymentReceiptDTO;
import cl.duoc.payments.dto.RefundDTO;
import cl.duoc.payments.service.PaymentService;

// IMPORTS DE SWAGGER (OPENAPI)
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments Controller", description = "Endpoints para la gestión de transacciones financieras, comprobantes y reembolsos")
public class PaymentController {
    
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    
    // GET: Obtener todos los pagos
    @GetMapping
    @Operation(summary = "Obtener todos los pagos", description = "Retorna una lista completa con todo el historial de transacciones registradas.")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        List<PaymentDTO> payments = paymentService.findAllPayments();
        return ResponseEntity.ok(payments);
    }

    // GET: Obtener un pago por ID
    @GetMapping("/{id}")
    @Operation(summary = "Obtener un pago por ID", description = "Busca y retorna los detalles de un registro de pago específico mediante su identificador único.")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Long id) {
        PaymentDTO payment = paymentService.findPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    // GET: Obtener pagos por appointment ID
    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Obtener pagos por ID de cita", description = "Retorna los pagos asociados a un código de cita médica en específico.")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByAppointmentId(@PathVariable Long appointmentId) {
        List<PaymentDTO> payments = paymentService.findPaymentsByAppointmentId(appointmentId);
        return ResponseEntity.ok(payments);
    }

    // GET: Obtener pagos por patient user ID
    @GetMapping("/patient/{patientUserId}")
    @Operation(summary = "Obtener pagos por ID de paciente", description = "Retorna el listado de transacciones efectuadas por un usuario paciente determinado.")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByPatientUserId(@PathVariable Long patientUserId) {
        List<PaymentDTO> payments = paymentService.findPaymentsByPatientUserId(patientUserId);
        return ResponseEntity.ok(payments);
    }

    // GET: Obtener pagos por estado
    @GetMapping("/status")
    @Operation(summary = "Obtener pagos por estado", description = "Filtra y lista las transacciones según su condición actual (ej: PENDING, COMPLETED, FAILED).")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByStatus(@RequestParam String status) {
        List<PaymentDTO> payments = paymentService.findPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }

    // POST: Crear un nuevo pago
    @PostMapping
    @Operation(summary = "Crear un nuevo pago", description = "Registra una nueva transacción financiera dentro del microservicio.")
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody PaymentDTO paymentDTO) {
        PaymentDTO createdPayment = paymentService.createPayment(paymentDTO);
        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
    }

    // PUT: Actualizar estado de un pago
    @PutMapping("/{id}/status")
    @Operation(summary = "Actualizar estado de un pago", description = "Modifica la condición del pago e indexa opcionalmente un código de pasarela externa de transacciones.")
    public ResponseEntity<PaymentDTO> updatePaymentStatus(@PathVariable Long id, 
                                                          @RequestParam String status,
                                                          @RequestParam(required = false) String transactionCode) {
        PaymentDTO updatedPayment = paymentService.updatePaymentStatus(id, status, transactionCode);
        return ResponseEntity.ok(updatedPayment);
    }

    // DELETE: Eliminar un pago (solo si está pendiente)
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un pago", description = "Remueve un registro de pago físico de la base de datos siempre que cumpla con el criterio de estar pendiente.")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== RECEIPTS ====================

    // POST: Generar comprobante de pago
    @PostMapping("/{paymentId}/receipt")
    @Operation(summary = "Generar comprobante de pago", description = "Emite y guarda un comprobante o boleta electrónica oficial asociado a una transacción exitosa.")
    public ResponseEntity<PaymentReceiptDTO> generateReceipt(@PathVariable Long paymentId) {
        PaymentReceiptDTO receipt = paymentService.generateReceipt(paymentId);
        return new ResponseEntity<>(receipt, HttpStatus.CREATED);
    }

    // GET: Obtener comprobante por payment ID
    @GetMapping("/{paymentId}/receipt")
    @Operation(summary = "Obtener comprobante por ID de pago", description = "Recupera la información técnica del comprobante de pago emitido.")
    public ResponseEntity<PaymentReceiptDTO> getReceiptByPaymentId(@PathVariable Long paymentId) {
        PaymentReceiptDTO receipt = paymentService.getReceiptByPaymentId(paymentId);
        return ResponseEntity.ok(receipt);
    }

    // ==================== REFUNDS ====================

    // POST: Solicitar reembolso
    @PostMapping("/{paymentId}/refund")
    @Operation(summary = "Solicitar reembolso", description = "Crea una petición de devolución total o parcial de dinero ligada a una transacción original indicando un motivo.")
    public ResponseEntity<RefundDTO> requestRefund(@PathVariable Long paymentId,
                                                   @RequestParam java.math.BigDecimal amount,
                                                   @RequestParam String reason) {
        RefundDTO refund = paymentService.requestRefund(paymentId, amount, reason);
        return new ResponseEntity<>(refund, HttpStatus.CREATED);
    }

    // PUT: Actualizar estado de reembolso
    @PutMapping("/refund/{refundId}/status")
    @Operation(summary = "Actualizar estado de reembolso", description = "Cambia el flujo operativo de una devolución (ej: de PENDING a APPROVED o REJECTED).")
    public ResponseEntity<RefundDTO> updateRefundStatus(@PathVariable Long refundId,
                                                        @RequestParam String status) {
        RefundDTO refund = paymentService.updateRefundStatus(refundId, status);
        return ResponseEntity.ok(refund);
    }

    // GET: Obtener reembolsos por payment ID
    @GetMapping("/{paymentId}/refunds")
    @Operation(summary = "Obtener reembolsos por ID de pago", description = "Lista todas las intenciones o registros de devoluciones asociadas a una misma transacción.")
    public ResponseEntity<List<RefundDTO>> getRefundsByPaymentId(@PathVariable Long paymentId) {
        List<RefundDTO> refunds = paymentService.getRefundsByPaymentId(paymentId);
        return ResponseEntity.ok(refunds);
    }
}