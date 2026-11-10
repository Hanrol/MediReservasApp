package cl.duoc.appointments.service;

import cl.duoc.appointments.client.UsersClient;
import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.AppointmentCreateRequestDTO;
import cl.duoc.appointments.dto.AppointmentResponseDTO;
import cl.duoc.appointments.model.Appointment;
import cl.duoc.appointments.repository.AppointmentCancellationRepository;
import cl.duoc.appointments.repository.AppointmentRepository;
import cl.duoc.appointments.repository.AppointmentStatusHistoryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
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
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class));

        Mockito.when(usersClient.userExists(1L)).thenReturn(true);
        Mockito.when(appointmentRepository.save(Mockito.any(Appointment.class))).thenReturn(savedEntity());

        AppointmentResponseDTO result = appointmentService.createAppointment(buildRequest(1L));

        assertThat(result).isNotNull();
        assertThat(result.getAppointmentId()).isEqualTo(10L);
        Mockito.verify(appointmentRepository).save(Mockito.any(Appointment.class));
        Mockito.verify(statusHistoryRepository).save(Mockito.any());
    }

    @Test
    void createAppointment_whenUserDoesNotExist_throwsRuntimeException() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        AppointmentStatusHistoryRepository statusHistoryRepository = Mockito.mock(AppointmentStatusHistoryRepository.class);
        AppointmentCancellationRepository cancellationRepository = Mockito.mock(AppointmentCancellationRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class));

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
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class));

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
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, statusHistoryRepository, cancellationRepository, usersClient, Mockito.mock(DoctorsClient.class));

        Mockito.when(appointmentRepository.existsById(10L)).thenReturn(true);

        boolean exists = appointmentService.existsAppointment(10L);

        assertThat(exists).isTrue();
        Mockito.verify(appointmentRepository).existsById(10L);
    }

    @Test
    void patientCannotCreateAppointmentForAnotherUser() {
        AppointmentRepository appointmentRepository = Mockito.mock(AppointmentRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository,
                Mockito.mock(AppointmentStatusHistoryRepository.class),
                Mockito.mock(AppointmentCancellationRepository.class),
                usersClient, Mockito.mock(DoctorsClient.class));
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
        AppointmentService appointmentService = new AppointmentService(
                appointmentRepository, historyRepository,
                Mockito.mock(AppointmentCancellationRepository.class), usersClient, Mockito.mock(DoctorsClient.class));
        Mockito.when(usersClient.getUserIdByEmail("patient@test.cl")).thenReturn(20L);
        Mockito.when(usersClient.userExists(20L)).thenReturn(true);
        Mockito.when(appointmentRepository.save(Mockito.any())).thenReturn(savedEntity());

        appointmentService.createAppointment(buildRequest(20L), "patient@test.cl", Set.of("PATIENT"));

        Mockito.verify(appointmentRepository).save(Mockito.any());
    }
}
