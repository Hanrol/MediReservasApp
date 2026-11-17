package cl.duoc.appointments.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.appointments.dto.ScheduleSlotRequest;
import cl.duoc.appointments.model.ScheduleSlot;
import cl.duoc.appointments.model.SlotStatus;
import cl.duoc.appointments.repository.AppointmentRepository;
import cl.duoc.appointments.repository.ScheduleSlotRepository;

@ExtendWith(MockitoExtension.class)
class ConcreteScheduleSlotServiceTest {
    @Mock
    private ScheduleSlotRepository scheduleSlotRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @InjectMocks
    private ScheduleSlotService service;

    @Test
    void rejectsOverlappingDuplicateTimeWithoutSaving() {
        ScheduleSlotRequest request = request(LocalTime.of(10, 0));
        when(scheduleSlotRepository.existsByDoctorIdAndSlotDateAndStartTimeLessThanAndEndTimeGreaterThan(
                4L, request.getSlotDate(), request.getEndTime(), request.getStartTime())).thenReturn(true);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Ya existe un horario");
        verify(scheduleSlotRepository, never()).save(any(ScheduleSlot.class));
    }

    @Test
    void createsThirtyMinuteConcreteSlotWhenTimeIsFree() {
        ScheduleSlotRequest request = request(LocalTime.of(10, 0));
        when(scheduleSlotRepository.existsByDoctorIdAndSlotDateAndStartTimeLessThanAndEndTimeGreaterThan(
                4L, request.getSlotDate(), request.getEndTime(), request.getStartTime())).thenReturn(false);
        when(scheduleSlotRepository.save(any(ScheduleSlot.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(request);

        assertThat(response.doctorId()).isEqualTo(4L);
        assertThat(response.startTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(response.endTime()).isEqualTo(LocalTime.of(10, 30));
        assertThat(response.slotStatus()).isEqualTo(SlotStatus.DISPONIBLE.name());
    }

    private ScheduleSlotRequest request(LocalTime startTime) {
        return new ScheduleSlotRequest(
                4L,
                LocalDate.now().plusDays(1),
                startTime,
                startTime.plusMinutes(30),
                SlotStatus.DISPONIBLE,
                null);
    }
}
