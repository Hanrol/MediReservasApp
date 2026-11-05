package cl.duoc.prescriptions.services;

import java.util.List;

import org.springframework.stereotype.Service;

import cl.duoc.prescriptions.dto.PrescriptionItemRequest;
import cl.duoc.prescriptions.dto.PrescriptionItemResponse;
import cl.duoc.prescriptions.dto.PrescriptionResponse;
import cl.duoc.prescriptions.model.Prescription;
import cl.duoc.prescriptions.model.PrescriptionItem;
import cl.duoc.prescriptions.repository.PrescriptionItemRepository;
import cl.duoc.prescriptions.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionItemService {

    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionItemResponse create(PrescriptionItemRequest request) {
        log.info("Iniciando creación de item para prescripción ID: {}", request.getPrescriptionId());

        Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                .orElseThrow(() -> new RuntimeException("Prescripción no encontrada con ID: " + request.getPrescriptionId()));

        PrescriptionItem item = new PrescriptionItem();
        item.setPrescription(prescription);
        item.setMedicineName(request.getMedicineName());
        item.setDosage(request.getDosage());
        item.setFrequency(request.getFrequency());
        item.setDuration(request.getDuration());
        item.setInstructions(request.getInstructions());

        PrescriptionItem saved = prescriptionItemRepository.save(item);
        log.info("Item creado exitosamente con ID: {}", saved.getPrescriptionItemId());

        return mapToResponse(saved);
    }

    public PrescriptionItemResponse findById(Long id) {
        log.info("Buscando item de prescripción con ID: {}", id);

        PrescriptionItem item = prescriptionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de prescripción no encontrado con ID: " + id));

        return mapToResponse(item);
    }

    public List<PrescriptionItemResponse> findAll() {
        log.info("Obteniendo todos los items de prescripciones");
        
        return prescriptionItemRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PrescriptionItemResponse update(Long id, PrescriptionItemRequest request) {
        log.info("Iniciando actualización de item ID: {}", id);

        PrescriptionItem item = prescriptionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de prescripción no encontrado con ID: " + id));

        Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                .orElseThrow(() -> new RuntimeException("Prescripción no encontrada con ID: " + request.getPrescriptionId()));

        item.setPrescription(prescription);
        item.setMedicineName(request.getMedicineName());
        item.setDosage(request.getDosage());
        item.setFrequency(request.getFrequency());
        item.setDuration(request.getDuration());
        item.setInstructions(request.getInstructions());

        PrescriptionItem updated = prescriptionItemRepository.save(item);
        log.info("Item ID: {} actualizado exitosamente", updated.getPrescriptionItemId());

        return mapToResponse(updated);
    }

    public void delete(Long id) {
        log.info("Iniciando eliminación de item ID: {}", id);

        if (!prescriptionItemRepository.existsById(id)) {
            throw new RuntimeException("Item de prescripción no encontrado con ID: " + id);
        }
        prescriptionItemRepository.deleteById(id);

        log.info("Item ID: {} eliminado exitosamente", id);
    }

    private PrescriptionItemResponse mapToResponse(PrescriptionItem item) {
        PrescriptionResponse prescriptionResponse = new PrescriptionResponse(
                item.getPrescription().getPrescriptionId(),
                item.getPrescription().getMedicalVisitId(),
                item.getPrescription().getPatientUserId(),
                item.getPrescription().getDoctorId(),
                item.getPrescription().getIssuedAt(),
                item.getPrescription().getPrescriptionStatus().name(),
                item.getPrescription().getNotes()
        );

        return new PrescriptionItemResponse(
                item.getPrescriptionItemId(),
                prescriptionResponse,
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions()
        );
    }
}