package cl.duoc.prescriptions.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import cl.duoc.prescriptions.client.DoctorsClient;
import cl.duoc.prescriptions.client.UsersClient;
import cl.duoc.prescriptions.dto.PrescriptionRequest;
import cl.duoc.prescriptions.dto.PrescriptionResponse;
import cl.duoc.prescriptions.model.Prescription;
import cl.duoc.prescriptions.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorsClient doctorsClient;
    private final UsersClient usersClient;

    public PrescriptionResponse create(PrescriptionRequest request) {
        log.info("Iniciando creación de prescripción para doctorId: {} y patientUserId: {}", request.getDoctorId(), request.getPatientUserId());
        
        doctorsClient.validateDoctor(request.getDoctorId());
        usersClient.validatePatient(request.getPatientUserId());

        Prescription prescription = new Prescription();
        prescription.setMedicalVisitId(request.getMedicalVisitId());
        prescription.setPatientUserId(request.getPatientUserId());
        prescription.setDoctorId(request.getDoctorId());
        prescription.setPrescriptionStatus(request.getPrescriptionStatus());
        prescription.setNotes(request.getNotes());
        prescription.setIssuedAt(LocalDateTime.now());

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescripción creada exitosamente con ID: {}", saved.getPrescriptionId());
        
        return mapToResponse(saved);
    }

    public PrescriptionResponse findById(Long id) {
        log.info("Buscando prescripción con ID: {}", id);
        
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescripción no encontrada con ID: " + id));
                
        return mapToResponse(prescription);
    }

    public List<PrescriptionResponse> findAll() {
        log.info("Obteniendo todas las prescripciones");
        
        return prescriptionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PrescriptionResponse update(Long id, PrescriptionRequest request) {
        log.info("Iniciando actualización de prescripción ID: {}", id);
        
        doctorsClient.validateDoctor(request.getDoctorId());
        usersClient.validatePatient(request.getPatientUserId());

        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescripción no encontrada con ID: " + id));

        prescription.setMedicalVisitId(request.getMedicalVisitId());
        prescription.setPatientUserId(request.getPatientUserId());
        prescription.setDoctorId(request.getDoctorId());
        prescription.setPrescriptionStatus(request.getPrescriptionStatus());
        prescription.setNotes(request.getNotes());

        Prescription updated = prescriptionRepository.save(prescription);
        log.info("Prescripción ID: {} actualizada exitosamente", updated.getPrescriptionId());
        
        return mapToResponse(updated);
    }

    public void delete(Long id) {
        log.info("Iniciando eliminación de prescripción ID: {}", id);
        
        if (!prescriptionRepository.existsById(id)) {
            throw new RuntimeException("Prescripción no encontrada con ID: " + id);
        }
        prescriptionRepository.deleteById(id);
        
        log.info("Prescripción ID: {} eliminada exitosamente", id);
    }

    private PrescriptionResponse mapToResponse(Prescription prescription) {
        return new PrescriptionResponse(
                prescription.getPrescriptionId(),
                prescription.getMedicalVisitId(),
                prescription.getPatientUserId(),
                prescription.getDoctorId(),
                prescription.getIssuedAt(),
                prescription.getPrescriptionStatus().name(),
                prescription.getNotes()
        );
    }
}