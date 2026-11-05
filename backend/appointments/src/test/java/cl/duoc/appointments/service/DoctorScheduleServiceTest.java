package cl.duoc.appointments.service;

import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.DoctorScheduleRequest;
import cl.duoc.appointments.dto.DoctorScheduleResponse;
import cl.duoc.appointments.model.DayOfWeek;
import cl.duoc.appointments.model.DoctorSchedule;
import cl.duoc.appointments.repository.DoctorScheduleRepository;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceTest {

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @InjectMocks
    private DoctorScheduleService doctorScheduleService;

    @Mock
    private DoctorsClient doctorsClient;

    @Test
    void createShouldSaveScheduleAndReturnResponse() {
        DoctorScheduleRequest request = new DoctorScheduleRequest(
                10L,
                DayOfWeek.LUNES,
                LocalTime.of(8, 0),
                LocalTime.of(12, 0),
                true);

        DoctorSchedule saved = new DoctorSchedule(
                1L,
                10L,
                DayOfWeek.LUNES,
                LocalTime.of(8, 0),
                LocalTime.of(12, 0),
                true);

        when(doctorScheduleRepository.save(any(DoctorSchedule.class))).thenReturn(saved);

        DoctorScheduleResponse response = doctorScheduleService.create(request);

        assertThat(response.doctorScheduleId()).isEqualTo(1L);
        assertThat(response.doctorId()).isEqualTo(10L);
        assertThat(response.dayOfWeek()).isEqualTo("LUNES");
        assertThat(response.startTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(response.endTime()).isEqualTo(LocalTime.of(12, 0));
        assertThat(response.active()).isTrue();

        verify(doctorScheduleRepository).save(any(DoctorSchedule.class));
    }

    @Test
    void findByIdShouldReturnResponseWhenFound() {
        DoctorSchedule schedule = new DoctorSchedule(
                1L,
                20L,
                DayOfWeek.VIERNES,
                LocalTime.of(14, 0),
                LocalTime.of(18, 0),
                false);

        when(doctorScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        DoctorScheduleResponse response = doctorScheduleService.findById(1L);

        assertThat(response.doctorScheduleId()).isEqualTo(1L);
        assertThat(response.doctorId()).isEqualTo(20L);
        assertThat(response.dayOfWeek()).isEqualTo("VIERNES");
        assertThat(response.active()).isFalse();
    }
}