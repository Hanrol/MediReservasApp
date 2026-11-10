package cl.duoc.appointments.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.stereotype.Service;

import cl.duoc.appointments.dto.ScheduleSlotRequest;
import cl.duoc.appointments.dto.ScheduleSlotResponse;
import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.repository.ScheduleSlotRepository;
import cl.duoc.appointments.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleSlotService {

    @Autowired
    private DoctorOwnershipVerifier ownershipVerifier;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private final ScheduleSlotRepository scheduleSlotRepository;

    public ScheduleSlotResponse create(ScheduleSlotRequest request) {
        validateAppointmentDoctor(request);
        ScheduleSlot slot = new ScheduleSlot();
        slot.setDoctorId(request.getDoctorId());
        slot.setSlotDate(request.getSlotDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setSlotStatus(request.getSlotStatus());
        slot.setAppointmentId(request.getAppointmentId());
        slot.setCreatedAt(LocalDateTime.now());

        ScheduleSlot saved = scheduleSlotRepository.save(slot);
        return mapToResponse(saved);
    }

    public ScheduleSlotResponse create(ScheduleSlotRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return create(request);
    }

    public ScheduleSlotResponse findById(Long id) {
        try {
            ScheduleSlot slot = scheduleSlotRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Schedule slot no encontrado con ID: " + id));
            return mapToResponse(slot);
        } catch (RuntimeException ex) {
            log.error("Error finding ScheduleSlot by id: {}", id, ex);
            throw ex;
        }
    }

    public ScheduleSlotResponse findById(Long id, String email, Set<String> roles) {
        ScheduleSlotResponse response = findById(id);
        ownershipVerifier.requireOwnDoctor(email, response.doctorId(), roles);
        return response;
    }

    public List<ScheduleSlotResponse> findAll() {
        return scheduleSlotRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ScheduleSlotResponse> findAll(String email, Set<String> roles) {
        List<ScheduleSlotResponse> all = findAll();
        if (!ownershipVerifier.isDoctorOnly(roles)) return all;
        Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
        return all.stream().filter(slot -> doctorId.equals(slot.doctorId())).toList();
    }

    public ScheduleSlotResponse update(Long id, ScheduleSlotRequest request) {
        validateAppointmentDoctor(request);
        try {
            ScheduleSlot slot = scheduleSlotRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Slot no encontrado con ID: " + id));

            slot.setDoctorId(request.getDoctorId());
            slot.setSlotDate(request.getSlotDate());
            slot.setStartTime(request.getStartTime());
            slot.setEndTime(request.getEndTime());
            slot.setSlotStatus(request.getSlotStatus());
            slot.setAppointmentId(request.getAppointmentId());

            ScheduleSlot updated = scheduleSlotRepository.save(slot);
            return mapToResponse(updated);
        } catch (RuntimeException ex) {
            log.error("Error updating ScheduleSlot with id: {}", id, ex);
            throw ex;
        }
    }

    private void validateAppointmentDoctor(ScheduleSlotRequest request) {
        if (request.getAppointmentId() == null) return;
        var appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cita asociada no existe"));
        if (!request.getDoctorId().equals(appointment.getDoctorId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El slot y la cita deben pertenecer al mismo médico");
        }
    }

    public ScheduleSlotResponse update(Long id, ScheduleSlotRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return update(id, request);
    }

    public void delete(Long id) {
        try {
            if (!scheduleSlotRepository.existsById(id)) {
                throw new RuntimeException("Schedule slot no encontrado con ID: " + id);
            }
            scheduleSlotRepository.deleteById(id);
        } catch (RuntimeException ex) {
            log.error("Error deleting ScheduleSlot with id: {}", id, ex);
            throw ex;
        }
    }

    public void delete(Long id, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        delete(id);
    }

    private ScheduleSlotResponse mapToResponse(ScheduleSlot slot) {
        return new ScheduleSlotResponse(
                slot.getScheduleSlotId(),
                slot.getDoctorId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getSlotStatus().name(),
                slot.getAppointmentId(),
                slot.getCreatedAt()
        );
    }
}
