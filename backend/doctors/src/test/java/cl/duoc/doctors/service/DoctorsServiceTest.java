package cl.duoc.doctors.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.duoc.doctors.client.AuthClient;
import cl.duoc.doctors.client.UsersClient;
import cl.duoc.doctors.dto.DoctorsDTO;
import cl.duoc.doctors.model.Doctors;
import cl.duoc.doctors.repository.DoctorsRepository;
import cl.duoc.doctors.repository.DoctorsSpecialtiesRepository;

@ExtendWith(MockitoExtension.class)
public class DoctorsServiceTest {

    @Mock
    private UsersClient usersClient;

    @Mock
    private AuthClient authClient;

    @Mock
    private DoctorsRepository doctorsRepository;

    @Mock
    private DoctorsSpecialtiesRepository doctorSpecialtiesRepository;

    @InjectMocks
    private DoctorsService doctorsService;

    private Doctors doctor;
    private DoctorsDTO doctorDTO;

    @BeforeEach
    void setUp() {
        doctor = new Doctors();
        doctor.setDoctorId(1L);
        doctor.setUserId(100L);
        doctor.setMedicalLicenseNumber("LIC-12345");
        doctor.setActive(true);
        doctor.setCreatedAt(new java.sql.Date(System.currentTimeMillis()));

        doctorDTO = new DoctorsDTO();
        doctorDTO.setDoctorId(1L);
        doctorDTO.setUserId(100L);
        doctorDTO.setMedicalLicenseNumber("LIC-12345");
        doctorDTO.setActive(true);
        doctorDTO.setSpecialtyIds(Arrays.asList(1L, 2L));
    }

    @Test
    void findAll_ShouldReturnListOfDoctors() {
        // Arrange
        List<Doctors> doctorsList = Arrays.asList(doctor);
        when(doctorsRepository.findAll()).thenReturn(doctorsList);

        // Act
        List<DoctorsDTO> result = doctorsService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(doctor.getDoctorId(), result.get(0).getDoctorId());
        verify(doctorsRepository, times(1)).findAll();
    }

    @Test
    void findById_ShouldReturnDoctor_WhenExists() {
        // Arrange
        Long doctorId = 1L;
        when(doctorsRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

        // Act
        DoctorsDTO result = doctorsService.findById(doctorId);

        // Assert
        assertNotNull(result);
        assertEquals(doctor.getDoctorId(), result.getDoctorId());
        assertEquals(doctor.getMedicalLicenseNumber(), result.getMedicalLicenseNumber());
        verify(doctorsRepository, times(1)).findById(doctorId);
    }

    @Test
    void findById_ShouldThrowException_WhenDoctorNotFound() {
        // Arrange
        Long doctorId = 999L;
        when(doctorsRepository.findById(doctorId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> doctorsService.findById(doctorId));

        assertEquals("Doctor no encontrado", exception.getMessage());
        verify(doctorsRepository, times(1)).findById(doctorId);
    }

    @Test
    void delete_ShouldDeactivateDoctor_WhenExists() {
        // Arrange
        Long doctorId = 1L;
        when(doctorsRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorsRepository.save(any(Doctors.class))).thenReturn(doctor);

        // Act
        doctorsService.delete(doctorId);

        // Assert
        assertFalse(doctor.getActive());
        verify(doctorsRepository, times(1)).findById(doctorId);
        verify(doctorsRepository, times(1)).save(doctor);
    }

    @Test
    void delete_ShouldThrowException_WhenDoctorNotFound() {
        // Arrange
        Long doctorId = 999L;
        when(doctorsRepository.findById(doctorId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> doctorsService.delete(doctorId));

        assertEquals("Doctor no encontrado", exception.getMessage());
        verify(doctorsRepository, times(1)).findById(doctorId);
        verify(doctorsRepository, never()).save(any(Doctors.class));
    }
}
