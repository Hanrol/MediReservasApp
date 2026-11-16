package cl.duoc.appointments.service;

import java.util.List;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.DoctorScheduleRequest;
import cl.duoc.appointments.dto.DoctorScheduleResponse;
import cl.duoc.appointments.model.DoctorSchedule;
import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.model.SlotStatus;
import cl.duoc.appointments.repository.DoctorScheduleRepository;
import cl.duoc.appointments.repository.ScheduleSlotRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    @Autowired
    private DoctorOwnershipVerifier ownershipVerifier;

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final DoctorsClient doctorsClient;

    @Transactional
    public DoctorScheduleResponse create(DoctorScheduleRequest request) {
        validateTimeRange(request);
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctorId(request.getDoctorId());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setActive(request.getActive());

        DoctorSchedule saved = doctorScheduleRepository.save(schedule);
        regenerateAvailability(request.getDoctorId());
        return mapToResponse(saved);
    }

    @Transactional
    public DoctorScheduleResponse create(DoctorScheduleRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return create(request);
    }

    public DoctorScheduleResponse findById(Long id) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario de doctor no encontrado con ID: " + id));
        return mapToResponse(schedule);
    }

    public DoctorScheduleResponse findById(Long id, String email, Set<String> roles) {
        DoctorScheduleResponse response = findById(id);
        ownershipVerifier.requireOwnDoctor(email, response.doctorId(), roles);
        return response;
    }

    public List<DoctorScheduleResponse> findAll() {
        return doctorScheduleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DoctorScheduleResponse> findAll(String email, Set<String> roles) {
        List<DoctorScheduleResponse> all = findAll();
        if (!ownershipVerifier.isDoctorOnly(roles)) return all;
        Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
        return all.stream().filter(schedule -> doctorId.equals(schedule.doctorId())).toList();
    }

    @Transactional
    public DoctorScheduleResponse update(Long id, DoctorScheduleRequest request) {
        validateTimeRange(request);
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario de doctor no encontrado con ID: " + id));

        Long previousDoctorId = schedule.getDoctorId();
        schedule.setDoctorId(request.getDoctorId());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setActive(request.getActive());

        DoctorSchedule updated = doctorScheduleRepository.save(schedule);
        regenerateAvailability(previousDoctorId);
        if (!previousDoctorId.equals(request.getDoctorId())) regenerateAvailability(request.getDoctorId());
        return mapToResponse(updated);
    }

    @Transactional
    public DoctorScheduleResponse update(Long id, DoctorScheduleRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return update(id, request);
    }

    @Transactional
    public void delete(Long id) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario de doctor no encontrado con ID: " + id));
        Long doctorId = schedule.getDoctorId();
        doctorScheduleRepository.deleteById(id);
        regenerateAvailability(doctorId);
    }

    @Transactional
    public void delete(Long id, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        delete(id);
    }

    @Transactional
    public void clearForCurrentDoctor(String email, Set<String> roles) {
        Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
        ownershipVerifier.requireOwnDoctor(email, doctorId, roles);
        doctorScheduleRepository.deleteByDoctorId(doctorId);
        regenerateAvailability(doctorId);
    }

    private DoctorScheduleResponse mapToResponse(DoctorSchedule schedule) {
        return new DoctorScheduleResponse(
                schedule.getDoctorScheduleId(),
                schedule.getDoctorId(),
                schedule.getDayOfWeek().name(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getActive()
        );
    }

    private void validateTimeRange(DoctorScheduleRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de término");
        }
    }

    @Transactional
    @Scheduled(cron = "0 5 0 * * *")
    public void refreshRollingAvailability() {
        doctorScheduleRepository.findByActiveTrue().stream()
                .map(DoctorSchedule::getDoctorId)
                .distinct()
                .forEach(this::regenerateAvailability);
    }

    private void regenerateAvailability(Long doctorId) {
        LocalDate today = LocalDate.now();
        LocalDate through = today.plusDays(29);
        scheduleSlotRepository.deleteByDoctorIdAndSlotDateBetweenAndSlotStatusAndAppointmentIdIsNull(
                doctorId, today, through, SlotStatus.DISPONIBLE);

        List<DoctorSchedule> activeSchedules = doctorScheduleRepository.findByDoctorId(doctorId).stream()
                .filter(DoctorSchedule::getActive)
                .toList();
        List<ScheduleSlot> remainingSlots = new java.util.ArrayList<>(
                scheduleSlotRepository.findByDoctorIdAndSlotDateBetween(doctorId, today, through));

        for (LocalDate date = today; !date.isAfter(through); date = date.plusDays(1)) {
            var day = mapDay(date.getDayOfWeek());
            for (DoctorSchedule schedule : activeSchedules) {
                if (schedule.getDayOfWeek() != day) continue;
                for (LocalTime start = schedule.getStartTime();
                        !start.plusMinutes(30).isAfter(schedule.getEndTime());
                        start = start.plusMinutes(30)) {
                    LocalTime end = start.plusMinutes(30);
                    LocalDate slotDate = date;
                    LocalTime slotStart = start;
                    boolean alreadyExists = remainingSlots.stream().anyMatch(slot ->
                            slot.getSlotDate().equals(slotDate)
                                    && slot.getStartTime().equals(slotStart));
                    if (alreadyExists) continue;
                    ScheduleSlot slot = new ScheduleSlot();
                    slot.setDoctorId(doctorId);
                    slot.setSlotDate(date);
                    slot.setStartTime(start);
                    slot.setEndTime(end);
                    slot.setSlotStatus(SlotStatus.DISPONIBLE);
                    slot.setAppointmentId(null);
                    slot.setCreatedAt(java.time.LocalDateTime.now());
                    remainingSlots.add(scheduleSlotRepository.save(slot));
                }
            }
        }
    }

    private cl.duoc.appointments.model.DayOfWeek mapDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> cl.duoc.appointments.model.DayOfWeek.LUNES;
            case TUESDAY -> cl.duoc.appointments.model.DayOfWeek.MARTES;
            case WEDNESDAY -> cl.duoc.appointments.model.DayOfWeek.MIERCOLES;
            case THURSDAY -> cl.duoc.appointments.model.DayOfWeek.JUEVES;
            case FRIDAY -> cl.duoc.appointments.model.DayOfWeek.VIERNES;
            case SATURDAY -> cl.duoc.appointments.model.DayOfWeek.SABADO;
            case SUNDAY -> cl.duoc.appointments.model.DayOfWeek.DOMINGO;
        };
    }
}
