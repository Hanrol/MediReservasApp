package cl.duoc.payments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.payments.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByAppointmentId(Long appointmentId);
    
    List<Payment> findByPatientUserId(Long patientUserId);
    
    List<Payment> findByPaymentStatus(String paymentStatus);
}