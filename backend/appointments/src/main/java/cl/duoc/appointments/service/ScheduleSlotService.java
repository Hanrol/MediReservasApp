package cl.duoc.appointments.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import cl.duoc.appointments.dto.ScheduleSlotRequest;
import cl.duoc.appointments.dto.ScheduleSlotResponse;
import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.repository.ScheduleSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleSlotService {

    private final ScheduleSlotRepository scheduleSlotRepository;

    public ScheduleSlotResponse create(ScheduleSlotRequest request) {
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

    public List<ScheduleSlotResponse> findAll() {
        return scheduleSlotRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ScheduleSlotResponse update(Long id, ScheduleSlotRequest request) {
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