package cl.duoc.appointments.service;

import cl.duoc.appointments.client.UsersClient;
import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.AppointmentCreateRequestDTO;
import cl.duoc.appointments.dto.AppointmentResponseDTO;
import cl.duoc.appointments.dto.AppointmentUpdateRequestDTO;
import cl.duoc.appointments.dto.AppointmentCancelRequestDTO;
import cl.duoc.appointments.dto.AppointmentStatusChangeRequestDTO;
import cl.duoc.appointments.model.Appointment;
import cl.duoc.appointments.enums.AppointmentStatus;
import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.model.SlotStatus;
import cl.duoc.appointments.repository.AppointmentCancellationRepository;
import cl.duoc.appointments.repository.AppointmentRepository;
import cl.duoc.appointments.repository.AppointmentStatusHistoryRepository;
import cl.duoc.appointments.repository.ScheduleSlotRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


class AppointmentServiceTest {

    private AppointmentCreateRequestDTO buildRequest(Long patientId) {
        AppointmentCreateRequestDTO dto = new AppointmentCreateRequestDTO();
        dto.setPatientUserId(patientId);
        dto.setDoctorId(2L);
        dto.setSpecialtyId(3L);
        dto.setScheduleSlotId(4L);
        dto.setReason("Consulta general");
        return dto;
    }

    private Appointment savedEntity() {
        Appointment a = new Appointment();
        a.setAppointmentId(10L);
        a.setPatientUserId(1L);
        a.setDoctorId(2L);
        a.setSpecialtyId(3L);
        a.setScheduleSlotId(4L);
        a.setReason("Consulta general");
        a.setCreatedAt(LocalDateTime.now());
        return a;
    }

    @Test
    void createAppointment_whenUserExists_savesAndReturnsDTO() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository statusHistoryRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellationRepository = Mockito.mock(AppointmentCancellationRepository.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);

        Mockito.when(usersClient.userExists(1L)).thenReturn(true);
        Mockito.when(scheduleSlotRepository.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(availableSlot()));
        Mockito.when(appointmentRepository.save(Mockito.any(Appointment.class))).thenReturn(savedEntity());

        AppointmentResponseDTO result = appointmentService.createAppointment(buildRequest(1L));

        assertThat(result).isNotNull();
        assertThat(result.getAppointmentId()).isEqualTo(10L);
        Mockito.verify(appointmentRepository).save(Mockito.any(Appointment.class));
        Mockito.verify(scheduleSlotRepository).save(Mockito.argThat(slot -> slot.getSlotStatus() == SlotStatus.RESERVADO));
        Mockito.verify(statusHistoryRepository).save(Mockito.any());
    }

    @Test
    void createAppointment_whenUserDoesNotExist_throwsRuntimeException() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository statusHistoryRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellationRepository = Mockito.mock(AppointmentCancellationRepository.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);

        Mockito.when(usersClient.userExists(99L)).thenReturn(false);

        assertThatThrownBy(() -> appointmentService.createAppointment(buildRequest(99L)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");

        Mockito.verify(appointmentRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void createAppointment_whenUsersClientThrows_throwsRuntimeException() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository statusHistoryRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellationRepository = Mockito.mock(AppointmentCancellationRepository.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);

        Mockito.when(usersClient.userExists(1L))
                .thenThrow(new RuntimeException("No se pudo conectar con Users Service"));

        assertThatThrownBy(() -> appointmentService.createAppointment(buildRequest(1L)))
                .isInstanceOf(RuntimeException.class);

        Mockito.verify(appointmentRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void existsAppointment_delegatesToRepository() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository statusHistoryRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellationRepository = Mockito.mock(AppointmentCancellationRepository.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);

        Mockito.when(appointmentRepository.existsById(10L)).thenReturn(true);

        boolean exists = appointmentService.existsAppointment(10L);

        assertThat(exists).isTrue();
        Mockito.verify(appointmentRepository).existsById(10L);
    }

    @Test
    void patientCannotCreateAppointmentForAnotherUser() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository,
                Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class),
                usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);
        Mockito.when(usersClient.getUserIdByEmail("patient@test.cl")).thenReturn(20L);

        assertThatThrownBy(() -> appointmentService.createAppointment(
                buildRequest(21L), "patient@test.cl", Set.of("PATIENT")))
                .hasMessageContaining("otro paciente");
        Mockito.verify(appointmentRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void patientCanCreateAppointmentOnlyForOwnUser() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository historyRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        ScheduleSlotRepository scheduleSlotRepository = Mockito.mock(ScheduleSlotRepository.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, historyRepository,
                Mockito.mock(AppointmentCancellationRepository.class), usersClient, Mockito.mock(DoctorsClient.class), scheduleSlotRepository);
        Mockito.when(usersClient.getUserIdByEmail("patient@test.cl")).thenReturn(20L);
        Mockito.when(usersClient.userExists(20L)).thenReturn(true);
        Mockito.when(scheduleSlotRepository.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(availableSlot()));
        Mockito.when(appointmentRepository.save(Mockito.any())).thenReturn(savedEntity());

        appointmentService.createAppointment(buildRequest(20L), "patient@test.cl", Set.of("PATIENT"));

        Mockito.verify(appointmentRepository).save(Mockito.any());
    }

    private ScheduleSlot availableSlot() {
        ScheduleSlot slot = new ScheduleSlot();
        slot.setScheduleSlotId(4L);
        slot.setDoctorId(2L);
        slot.setSlotDate(LocalDate.now(ZoneId.of("America/Santiago")).plusDays(2));
        slot.setStartTime(LocalTime.of(10, 0));
        slot.setEndTime(LocalTime.of(10, 30));
        slot.setSlotStatus(SlotStatus.DISPONIBLE);
        return slot;
    }

    @Test
    void updateAppointment_releasesOldSlotAndReservesNewSlot() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        Appointment appointment = savedEntity();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot oldSlot = availableSlot();
        oldSlot.setSlotStatus(SlotStatus.RESERVADO);
        oldSlot.setAppointmentId(10L);
        ScheduleSlot newSlot = availableSlot();
        newSlot.setScheduleSlotId(5L);
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(appointment));
        Mockito.when(appointments.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(slots.findById(4L)).thenReturn(java.util.Optional.of(oldSlot));
        Mockito.when(slots.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(oldSlot));
        Mockito.when(slots.findByIdForUpdate(5L)).thenReturn(java.util.Optional.of(newSlot));
        AppointmentService service = new AppointmentService(
                appointments, Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class), Mockito.mock(UsersClient.class),
                Mockito.mock(DoctorsClient.class), slots);
        AppointmentUpdateRequestDTO request = new AppointmentUpdateRequestDTO();
        request.setDoctorId(2L);
        request.setSpecialtyId(3L);
        request.setScheduleSlotId(5L);
        request.setReason("Reagendada");

        service.updateAppointment(10L, request);

        assertThat(oldSlot.getSlotStatus()).isEqualTo(SlotStatus.LIBERADO_POR_CANCELACION);
        assertThat(oldSlot.getAppointmentId()).isNull();
        assertThat(newSlot.getSlotStatus()).isEqualTo(SlotStatus.RESERVADO);
        assertThat(newSlot.getAppointmentId()).isEqualTo(10L);
        assertThat(appointment.getScheduleSlotId()).isEqualTo(5L);
    }

    @Test
    void cancelAppointment_releasesAssociatedSlot() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        Appointment appointment = savedEntity();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot slot = availableSlot();
        slot.setSlotStatus(SlotStatus.RESERVADO);
        slot.setAppointmentId(10L);
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(appointment));
        Mockito.when(appointments.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(slots.findById(4L)).thenReturn(java.util.Optional.of(slot));
        Mockito.when(slots.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(slot));
        AppointmentService service = new AppointmentService(
                appointments, Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class), Mockito.mock(UsersClient.class),
                Mockito.mock(DoctorsClient.class), slots);
        AppointmentCancelRequestDTO request = new AppointmentCancelRequestDTO();
        request.setCancelledByUserId(99L);
        request.setCancellationReason("Solicitud de recepción");

        service.cancelAppointment(10L, request);

        assertThat(slot.getSlotStatus()).isEqualTo(SlotStatus.LIBERADO_POR_CANCELACION);
        assertThat(slot.getAppointmentId()).isNull();
        assertThat(appointment.getAppointmentStatus()).isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    void cancelledAppointmentSlotCanBeReservedAgain() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        Appointment cancelled = savedEntity();
        cancelled.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot slot = availableSlot();
        slot.setSlotStatus(SlotStatus.RESERVADO);
        slot.setAppointmentId(cancelled.getAppointmentId());
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(cancelled));
        Mockito.when(appointments.save(Mockito.any())).thenAnswer(invocation -> {
            Appointment saved = invocation.getArgument(0);
            if (saved.getAppointmentId() == null) saved.setAppointmentId(11L);
            return saved;
        });
        UsersClient users = Mockito.mock(UsersClient.class);
        Mockito.when(users.userExists(1L)).thenReturn(true);
        Mockito.when(slots.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(slot));
        AppointmentService service = new AppointmentService(
                appointments, Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class), users,
                Mockito.mock(DoctorsClient.class), slots);

        service.cancelAppointment(10L, new AppointmentCancelRequestDTO());
        service.createAppointment(buildRequest(1L));

        assertThat(slot.getSlotStatus()).isEqualTo(SlotStatus.RESERVADO);
        assertThat(slot.getAppointmentId()).isEqualTo(11L);
        Mockito.verify(appointments, Mockito.times(2)).save(Mockito.any(Appointment.class));
    }

    @Test
    void receptionistCannotCreateAppointmentEvenWhenPatientIdIsSupplied() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService service = new AppointmentService(
                appointments,
                Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class),
                usersClient,
                Mockito.mock(DoctorsClient.class),
                Mockito.mock(ScheduleSlotRepository.class));

        assertThatThrownBy(() -> service.createAppointment(
                buildRequest(21L), "reception@test.cl", Set.of("RECEPTIONIST")))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("Solo el paciente");
        Mockito.verifyNoInteractions(usersClient);
        Mockito.verify(appointments, Mockito.never()).save(Mockito.any());
    }

    @Test
    void pendingAppointmentIsAutomaticallyCancelledAtOneMinuteCutoffAndSlotReleased() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository history = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellations = Mockito.mock(AppointmentCancellationRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        Appointment appointment = savedEntity();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot slot = availableSlot();
        slot.setSlotDate(LocalDate.of(2026, 11, 17));
        slot.setStartTime(LocalTime.of(10, 0));
        slot.setSlotStatus(SlotStatus.RESERVADO);
        slot.setAppointmentId(appointment.getAppointmentId());
        Mockito.when(appointments.findByAppointmentStatus(AppointmentStatus.PENDING))
                .thenReturn(java.util.List.of(appointment));
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(appointment));
        Mockito.when(slots.findById(4L)).thenReturn(java.util.Optional.of(slot));
        Mockito.when(slots.findByIdForUpdate(4L)).thenReturn(java.util.Optional.of(slot));
        AppointmentService service = new AppointmentService(
                appointments, history, cancellations, Mockito.mock(UsersClient.class),
                Mockito.mock(DoctorsClient.class), slots);

        service.cancelPendingAppointmentsBeforeStart(LocalDateTime.of(2026, 11, 17, 9, 59));

        assertThat(appointment.getAppointmentStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(slot.getSlotStatus()).isEqualTo(SlotStatus.LIBERADO_POR_CANCELACION);
        assertThat(slot.getAppointmentId()).isNull();
        Mockito.verify(appointments).save(appointment);
        Mockito.verify(history).save(Mockito.argThat(item ->
                item.getOldStatus() == AppointmentStatus.PENDING
                        && item.getNewStatus() == AppointmentStatus.CANCELLED
                        && item.getChangedByUserId() == null
                        && item.getChangeReason().contains("automática")));
        Mockito.verifyNoInteractions(cancellations);
    }

    @Test
    void receptionistCannotConfirmAnAppointmentAtOrAfterItsCutoff() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        Appointment appointment = savedEntity();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot slot = availableSlot();
        LocalDateTime start = LocalDateTime.now(ZoneId.of("America/Santiago")).plusSeconds(30);
        slot.setSlotDate(start.toLocalDate());
        slot.setStartTime(start.toLocalTime());
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(appointment));
        Mockito.when(slots.findById(4L)).thenReturn(java.util.Optional.of(slot));
        AppointmentService service = new AppointmentService(
                appointments,
                Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class),
                Mockito.mock(UsersClient.class),
                Mockito.mock(DoctorsClient.class),
                slots);

        assertThatThrownBy(() -> service.confirmAppointment(
                10L, new AppointmentStatusChangeRequestDTO(), "reception@test.cl", Set.of("RECEPTIONIST")))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("plazo");
        Mockito.verify(appointments, Mockito.never()).save(Mockito.any());
    }

    @Test
    void receptionistCanConfirmPendingAppointmentBeforeItsCutoff() {
        AppointmentRepository appointments = Mockito.mock(AppointmentRepository.class);
        ScheduleSlotRepository slots = Mockito.mock(ScheduleSlotRepository.class);
        AppointmentStatusHistoryRepository history = Mockito.mock(AppointmentStatusHistoryRepository.class);
        Appointment appointment = savedEntity();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        ScheduleSlot slot = availableSlot();
        Mockito.when(appointments.findByIdForUpdate(10L)).thenReturn(java.util.Optional.of(appointment));
        Mockito.when(appointments.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(slots.findById(4L)).thenReturn(java.util.Optional.of(slot));
        AppointmentService service = new AppointmentService(
                appointments,
                history,
                Mockito.mock(AppointmentCancellationRepository.class),
                Mockito.mock(UsersClient.class),
                Mockito.mock(DoctorsClient.class),
                slots);
        AppointmentStatusChangeRequestDTO request = new AppointmentStatusChangeRequestDTO();
        request.setChangeReason("Confirmada por recepción");

        service.confirmAppointment(10L, request, "reception@test.cl", Set.of("RECEPTIONIST"));

        assertThat(appointment.getAppointmentStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        Mockito.verify(history).save(Mockito.argThat(item ->
                item.getOldStatus() == AppointmentStatus.PENDING
                        && item.getNewStatus() == AppointmentStatus.CONFIRMED));
    }
}
