package cl.duoc.appointments.service;

import cl.duoc.appointments.client.UsersClient;
import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.AppointmentCancelRequestDTO;
import cl.duoc.appointments.dto.AppointmentCreateRequestDTO;
import cl.duoc.appointments.dto.AppointmentResponseDTO;
import cl.duoc.appointments.dto.AppointmentStatusChangeRequestDTO;
import cl.duoc.appointments.dto.AppointmentUpdateRequestDTO;
import cl.duoc.appointments.enums.AppointmentStatus;
import cl.duoc.appointments.model.Appointment;
import cl.duoc.appointments.model.AppointmentCancellation;
import cl.duoc.appointments.model.AppointmentStatusHistory;
import cl.duoc.appointments.repository.AppointmentCancellationRepository;
import cl.duoc.appointments.repository.AppointmentRepository;
import cl.duoc.appointments.repository.AppointmentStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final AppointmentCancellationRepository cancellationRepository;
    // Cambio: cliente para validar patientUserId contra users-service.
    private final UsersClient usersClient;
    private final DoctorsClient doctorsClient;

    public AppointmentResponseDTO createAppointment(AppointmentCreateRequestDTO dto) {

        // Cambio: valida que el paciente exista en users-service antes de crear la cita.
        if (!usersClient.userExists(dto.getPatientUserId())) {
            log.warn("Usuario paciente no encontrado en users-service: {}", dto.getPatientUserId());
            throw new RuntimeException("Usuario no encontrado con ID: " + dto.getPatientUserId());
        }

        Appointment appointment = new Appointment();
        appointment.setPatientUserId(dto.getPatientUserId());
        appointment.setDoctorId(dto.getDoctorId());
        appointment.setSpecialtyId(dto.getSpecialtyId());
        appointment.setScheduleSlotId(dto.getScheduleSlotId());
        appointment.setReason(dto.getReason());
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        // Primer registro en historial: old_status null porque la cita recién nace
        saveHistory(saved, null, AppointmentStatus.PENDING, null, "Cita creada");

    
        return toResponseDTO(saved);
    }

    public AppointmentResponseDTO createAppointment(AppointmentCreateRequestDTO dto, String email, Set<String> roles) {
        if (roles.contains("PATIENT") && !hasStaffOverride(roles)) {
            assertPatientOwnsUser(email, dto.getPatientUserId());
        }
        return createAppointment(dto);
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public AppointmentResponseDTO getAppointmentById(Long id) {
        return toResponseDTO(findOrThrow(id));
    }

    public AppointmentResponseDTO getAppointmentById(Long id, String email, Set<String> roles) {
        Appointment appointment = findOrThrow(id);
        if (roles.contains("PATIENT") && !hasStaffOverride(roles)) {
            assertPatientOwnsUser(email, appointment.getPatientUserId());
        }
        return toResponseDTO(appointment);
    }

    public boolean existsAppointment(Long id) {
        return appointmentRepository.existsById(id);
    }

    public List<AppointmentResponseDTO> getByPatientUserId(Long patientUserId) {
        return appointmentRepository.findByPatientUserId(patientUserId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<AppointmentResponseDTO> getByPatientUserId(Long patientUserId, String email, Set<String> roles) {
        if (roles.contains("PATIENT") && !hasStaffOverride(roles)) {
            assertPatientOwnsUser(email, patientUserId);
        }
        return getByPatientUserId(patientUserId);
    }

    public List<AppointmentResponseDTO> getByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<AppointmentResponseDTO> getByDoctorId(Long doctorId, String email, Set<String> roles) {
        assertDoctorOwnsResourceIfDoctor(email, doctorId, roles);
        return getByDoctorId(doctorId);
    }

    public AppointmentResponseDTO updateAppointment(Long id, AppointmentUpdateRequestDTO dto) {
        Appointment appointment = findOrThrow(id);

        // Regla: solo se puede editar si está PENDING (confirmadas o cerradas no se tocan)
        if (appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            log.warn("Intento de editar cita ID {} en estado inválido: {}", id, appointment.getAppointmentStatus());
            throw new RuntimeException(
                "Solo se pueden editar citas en estado PENDING. Estado actual: "
                + appointment.getAppointmentStatus());
        }

        appointment.setDoctorId(dto.getDoctorId());
        appointment.setSpecialtyId(dto.getSpecialtyId());
        appointment.setScheduleSlotId(dto.getScheduleSlotId());
        appointment.setReason(dto.getReason());

        Appointment updated = appointmentRepository.save(appointment);

        // Historial: status no cambia, pero igual queda trazado que se editó
        saveHistory(updated, AppointmentStatus.PENDING, AppointmentStatus.PENDING,
                dto.getChangedByUserId(), dto.getChangeReason());


        return toResponseDTO(updated);
    }

    public AppointmentResponseDTO confirmAppointment(Long id, AppointmentStatusChangeRequestDTO dto) {
        Appointment appointment = findOrThrow(id);

        // Regla: solo desde PENDING
        validateTransition(appointment, AppointmentStatus.PENDING, "confirmar");

        AppointmentStatus oldStatus = appointment.getAppointmentStatus();
        appointment.setAppointmentStatus(AppointmentStatus.CONFIRMED);

        Appointment updated = appointmentRepository.save(appointment);
        saveHistory(updated, oldStatus, AppointmentStatus.CONFIRMED,
                dto.getChangedByUserId(), dto.getChangeReason());

        return toResponseDTO(updated);
    }

    public AppointmentResponseDTO confirmAppointment(Long id, AppointmentStatusChangeRequestDTO dto, String email, Set<String> roles) {
        assertDoctorOwnsAppointment(findOrThrow(id), email, roles);
        if (roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST")) {
            dto.setChangedByUserId(usersClient.getUserIdByEmail(email));
        }
        return confirmAppointment(id, dto);
    }

    public AppointmentResponseDTO cancelAppointment(Long id, AppointmentCancelRequestDTO dto) {
        Appointment appointment = findOrThrow(id);

        // Regla: solo desde PENDING o CONFIRMED (completadas o ya canceladas no se pueden cancelar)
        if (appointment.getAppointmentStatus() != AppointmentStatus.PENDING
                && appointment.getAppointmentStatus() != AppointmentStatus.CONFIRMED) {
            log.warn("Intento de cancelar cita ID {} en estado inválido: {}", id, appointment.getAppointmentStatus());
            throw new RuntimeException(
                "Solo se pueden cancelar citas en estado PENDING o CONFIRMED. Estado actual: "
                + appointment.getAppointmentStatus());
        }

        AppointmentStatus oldStatus = appointment.getAppointmentStatus();
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED);

        Appointment updated = appointmentRepository.save(appointment);

        // Regla diferencial: cancelar además crea registro en appointment_cancellations
        AppointmentCancellation cancellation = new AppointmentCancellation();
        cancellation.setAppointment(updated);
        cancellation.setCancelledByUserId(dto.getCancelledByUserId());
        cancellation.setCancellationReason(dto.getCancellationReason());
        cancellationRepository.save(cancellation);

        saveHistory(updated, oldStatus, AppointmentStatus.CANCELLED,
                dto.getCancelledByUserId(), dto.getCancellationReason());


        return toResponseDTO(updated);
    }

    public AppointmentResponseDTO cancelAppointment(Long id, AppointmentCancelRequestDTO dto, String email, Set<String> roles) {
        Appointment appointment = findOrThrow(id);
        if (roles.contains("PATIENT") && !hasStaffOverride(roles)) {
            assertPatientOwnsUser(email, appointment.getPatientUserId());
            // Never accept a caller-supplied identity as the cancellation actor.
            dto.setCancelledByUserId(usersClient.getUserIdByEmail(email));
        }
        return cancelAppointment(id, dto);
    }

    private void assertPatientOwnsUser(String email, Long requestedUserId) {
        if (email == null || !usersClient.getUserIdByEmail(email).equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a recursos de otro paciente");
        }
    }

    private boolean hasStaffOverride(Set<String> roles) {
        return roles.contains("ADMIN") || roles.contains("RECEPTIONIST");
    }

    public AppointmentResponseDTO completeAppointment(Long id, AppointmentStatusChangeRequestDTO dto) {
        Appointment appointment = findOrThrow(id);

        // Regla: solo desde CONFIRMED (no se puede completar una cita que aún no fue confirmada)
        validateTransition(appointment, AppointmentStatus.CONFIRMED, "completar");

        AppointmentStatus oldStatus = appointment.getAppointmentStatus();
        appointment.setAppointmentStatus(AppointmentStatus.COMPLETED);

        Appointment updated = appointmentRepository.save(appointment);
        saveHistory(updated, oldStatus, AppointmentStatus.COMPLETED,
                dto.getChangedByUserId(), dto.getChangeReason());


        return toResponseDTO(updated);
    }

    public AppointmentResponseDTO completeAppointment(Long id, AppointmentStatusChangeRequestDTO dto, String email, Set<String> roles) {
        assertDoctorOwnsAppointment(findOrThrow(id), email, roles);
        if (roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST")) {
            dto.setChangedByUserId(usersClient.getUserIdByEmail(email));
        }
        return completeAppointment(id, dto);
    }

    public AppointmentResponseDTO markNoShow(Long id, AppointmentStatusChangeRequestDTO dto) {
        Appointment appointment = findOrThrow(id);

        // Regla: solo desde CONFIRMED (igual que completar, el médico ya esperó al paciente)
        validateTransition(appointment, AppointmentStatus.CONFIRMED, "marcar como inasistencia");

        AppointmentStatus oldStatus = appointment.getAppointmentStatus();
        appointment.setAppointmentStatus(AppointmentStatus.NO_SHOW);

        Appointment updated = appointmentRepository.save(appointment);
        saveHistory(updated, oldStatus, AppointmentStatus.NO_SHOW,
                dto.getChangedByUserId(), dto.getChangeReason());

        return toResponseDTO(updated);
    }

    public AppointmentResponseDTO markNoShow(Long id, AppointmentStatusChangeRequestDTO dto, String email, Set<String> roles) {
        assertDoctorOwnsAppointment(findOrThrow(id), email, roles);
        if (roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST")) {
            dto.setChangedByUserId(usersClient.getUserIdByEmail(email));
        }
        return markNoShow(id, dto);
    }

    private void assertDoctorOwnsAppointment(Appointment appointment, String email, Set<String> roles) {
        assertDoctorOwnsResourceIfDoctor(email, appointment.getDoctorId(), roles);
    }

    private void assertDoctorOwnsResourceIfDoctor(String email, Long doctorId, Set<String> roles) {
        if (roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST")
                && (email == null || !usersClient.getUserIdByEmail(email).equals(doctorsClient.getUserIdForDoctor(doctorId)))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a recursos de otro médico");
        }
    }

    // Busca la cita o lanza 404 — centraliza el findById().orElseThrow
    private Appointment findOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Cita no encontrada con ID: {}", id);
                    return new RuntimeException("Cita no encontrada con ID: " + id);
                });
    }

    // Valida que el status actual sea el requerido para la transición
    private void validateTransition(Appointment appointment, AppointmentStatus required, String action) {
        if (appointment.getAppointmentStatus() != required) {
            log.warn("Transición inválida para cita ID {}: se requiere {} pero está en {}",
                    appointment.getAppointmentId(), required, appointment.getAppointmentStatus());
            throw new RuntimeException(
                "No se puede " + action + " una cita en estado "
                + appointment.getAppointmentStatus()
                + ". Se requiere: " + required);
        }
    }

    // Graba un registro en appointment_status_history — se llama en cada cambio de estado
    private void saveHistory(Appointment appointment, AppointmentStatus oldStatus,
                              AppointmentStatus newStatus, Long changedByUserId, String changeReason) {
        AppointmentStatusHistory history = new AppointmentStatusHistory();
        history.setAppointment(appointment);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedByUserId(changedByUserId);
        history.setChangeReason(changeReason);
        statusHistoryRepository.save(history);
    }

    private AppointmentResponseDTO toResponseDTO(Appointment entity) {
        return AppointmentResponseDTO.builder()
                .appointmentId(entity.getAppointmentId())
                .patientUserId(entity.getPatientUserId())
                .doctorId(entity.getDoctorId())
                .specialtyId(entity.getSpecialtyId())
                .scheduleSlotId(entity.getScheduleSlotId())
                .appointmentStatus(entity.getAppointmentStatus())
                .reason(entity.getReason())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
