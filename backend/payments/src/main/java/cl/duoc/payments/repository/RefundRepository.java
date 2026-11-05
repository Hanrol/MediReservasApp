package cl.duoc.payments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.payments.model.Refund;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    
    List<Refund> findByPayment_PaymentId(Long paymentId);
    
    List<Refund> findByRefundStatus(String refundStatus);
}