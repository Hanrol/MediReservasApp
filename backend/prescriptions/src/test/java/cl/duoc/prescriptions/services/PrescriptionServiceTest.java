package cl.duoc.prescriptions.services;

import java.time.LocalDateTime;
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

import cl.duoc.prescriptions.client.DoctorsClient;
import cl.duoc.prescriptions.client.UsersClient;
import cl.duoc.prescriptions.dto.PrescriptionRequest;
import cl.duoc.prescriptions.dto.PrescriptionResponse;
import cl.duoc.prescriptions.model.Prescription;
import cl.duoc.prescriptions.model.PrescriptionStatus;
import cl.duoc.prescriptions.repository.PrescriptionRepository;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private DoctorsClient doctorsClient;

    @Mock
    private UsersClient usersClient;

    @InjectMocks
    private PrescriptionService prescriptionService;

    @Test
    void createShouldSavePrescriptionAndReturnResponse() {
        PrescriptionRequest request = new PrescriptionRequest(
                100L,
                200L,
                300L,
                PrescriptionStatus.ACTIVO,
                "Take once daily");

        Prescription saved = new Prescription(
                1L,
                100L,
                200L,
                300L,
                LocalDateTime.of(2026, 1, 1, 10, 0),
                PrescriptionStatus.ACTIVO,
                "Take once daily");

        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(saved);

        PrescriptionResponse response = prescriptionService.create(request);

        assertThat(response.prescriptionId()).isEqualTo(1L);
        assertThat(response.medicalVisitId()).isEqualTo(100L);
        assertThat(response.patientUserId()).isEqualTo(200L);
        assertThat(response.doctorId()).isEqualTo(300L);
        assertThat(response.prescriptionStatus()).isEqualTo("ACTIVO");
        assertThat(response.notes()).isEqualTo("Take once daily");

        verify(prescriptionRepository).save(any(Prescription.class));
    }

    @Test
    void findByIdShouldReturnResponseWhenFound() {
        Prescription prescription = new Prescription(
                1L,
                100L,
                200L,
                300L,
                LocalDateTime.of(2026, 1, 1, 10, 0),
                PrescriptionStatus.ACTIVO,
                "Take once daily");

        when(prescriptionRepository.findById(1L)).thenReturn(Optional.of(prescription));

        PrescriptionResponse response = prescriptionService.findById(1L);

        assertThat(response.prescriptionId()).isEqualTo(1L);
        assertThat(response.prescriptionStatus()).isEqualTo("ACTIVO");
        assertThat(response.notes()).isEqualTo("Take once daily");
    }
}
