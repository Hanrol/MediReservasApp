package cl.duoc.payments.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.payments.model.PaymentReceipt;

public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
    
    Optional<PaymentReceipt> findByPayment_PaymentId(Long paymentId);
    
    Optional<PaymentReceipt> findByReceiptNumber(String receiptNumber);
}