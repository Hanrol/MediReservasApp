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
import cl.duoc.doctors.dto.AuthUserRoleResponseDTO;
import cl.duoc.doctors.dto.UserInternalResponseDTO;
import cl.duoc.doctors.model.Doctors;
import cl.duoc.doctors.model.Specialty;
import cl.duoc.doctors.repository.DoctorsRepository;
import cl.duoc.doctors.repository.DoctorsSpecialtiesRepository;
import cl.duoc.doctors.repository.SpecialtyRepository;

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

    @Mock
    private SpecialtyRepository specialtyRepository;

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

    @Test
    void save_createsProfessionalProfileWithoutAssigningRoleWhenUserIsAlreadyDoctor() {
        doctorDTO.setSpecialtyIds(List.of(1L));
        UserInternalResponseDTO user = new UserInternalResponseDTO(100L, 200L, "12345678-5", "doctor@example.test", true);
        Specialty specialty = new Specialty();
        specialty.setSpecialtyId(1L);
        specialty.setActive(true);
        when(doctorsRepository.existsByUserId(100L)).thenReturn(false);
        when(doctorsRepository.existsByMedicalLicenseNumber("LIC-12345")).thenReturn(false);
        when(usersClient.getUserById(100L)).thenReturn(user);
        when(authClient.getAuthUserByEmail("doctor@example.test")).thenReturn(
                new AuthUserRoleResponseDTO(200L, "doctor@example.test", true, List.of("DOCTOR")));
        when(usersClient.hasGeneralProfile(100L)).thenReturn(true);
        when(usersClient.hasPatientProfile(100L)).thenReturn(false);
        when(usersClient.hasReceptionistProfile(100L)).thenReturn(false);
        when(usersClient.hasAdministratorProfile(100L)).thenReturn(false);
        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(specialty));
        when(doctorsRepository.save(any(Doctors.class))).thenAnswer(invocation -> {
            Doctors saved = invocation.getArgument(0);
            saved.setDoctorId(7L);
            return saved;
        });
        when(doctorSpecialtiesRepository.saveAll(any())).thenReturn(List.of());

        DoctorsDTO result = doctorsService.save(doctorDTO);

        assertEquals(7L, result.getDoctorId());
        assertEquals(100L, result.getUserId());
        verify(authClient).getAuthUserByEmail("doctor@example.test");
        verifyNoMoreInteractions(authClient);
    }

    @Test
    void save_rejectsUserWithoutDoctorRole() {
        when(doctorsRepository.existsByUserId(100L)).thenReturn(false);
        when(doctorsRepository.existsByMedicalLicenseNumber("LIC-12345")).thenReturn(false);
        when(usersClient.getUserById(100L)).thenReturn(
                new UserInternalResponseDTO(100L, 200L, "12345678-5", "patient@example.test", true));
        when(authClient.getAuthUserByEmail("patient@example.test")).thenReturn(
                new AuthUserRoleResponseDTO(200L, "patient@example.test", true, List.of("PATIENT")));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> doctorsService.save(doctorDTO));

        assertEquals("El usuario debe tener una cuenta activa con rol DOCTOR", exception.getMessage());
        verify(doctorsRepository, never()).save(any(Doctors.class));
        verifyNoMoreInteractions(authClient);
    }

    @Test
    void update_flushesRemovedSpecialtiesBeforeRecreatingRelations() {
        Specialty cardio = new Specialty();
        cardio.setSpecialtyId(1L);
        Specialty pediatrics = new Specialty();
        pediatrics.setSpecialtyId(2L);
        when(doctorsRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(cardio));
        when(specialtyRepository.findById(2L)).thenReturn(Optional.of(pediatrics));
        when(doctorSpecialtiesRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(doctorsRepository.save(doctor)).thenReturn(doctor);

        DoctorsDTO result = doctorsService.update(1L, doctorDTO);

        assertEquals(List.of(1L, 2L), result.getSpecialtyIds());
        org.mockito.InOrder order = inOrder(doctorSpecialtiesRepository);
        order.verify(doctorSpecialtiesRepository).deleteByDoctor(doctor);
        order.verify(doctorSpecialtiesRepository).flush();
        order.verify(doctorSpecialtiesRepository).saveAll(any());
    }
}
