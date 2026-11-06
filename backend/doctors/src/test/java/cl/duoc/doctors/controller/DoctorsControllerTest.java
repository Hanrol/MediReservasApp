package cl.duoc.doctors.controller;

import cl.duoc.doctors.dto.DoctorsDTO;
import cl.duoc.doctors.exception.GlobalExceptionHandler;
import cl.duoc.doctors.service.DoctorsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@ExtendWith(MockitoExtension.class)
class DoctorsControllerTest {

    private MockMvc mockMvc;
    private DoctorsService doctorsService;

    @BeforeEach
    void setup() {
        // Crear mock del servicio
        doctorsService = org.mockito.Mockito.mock(DoctorsService.class);

        // Crear el controlador con el mock
        DoctorsController doctorsController = new DoctorsController(doctorsService);

        // Configurar MockMvc con el controlador y el manejador de excepciones
        mockMvc = MockMvcBuilders
                .standaloneSetup(doctorsController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllDoctors_ShouldReturnListOfDoctors() throws Exception {
        // Arrange - Preparar datos de prueba
        DoctorsDTO doctor1 = new DoctorsDTO();
        doctor1.setDoctorId(1L);
        doctor1.setUserId(100L);
        doctor1.setMedicalLicenseNumber("LIC-12345");
        doctor1.setActive(true);
        doctor1.setSpecialtyIds(Arrays.asList(1L, 2L));

        DoctorsDTO doctor2 = new DoctorsDTO();
        doctor2.setDoctorId(2L);
        doctor2.setUserId(101L);
        doctor2.setMedicalLicenseNumber("LIC-67890");
        doctor2.setActive(true);
        doctor2.setSpecialtyIds(Arrays.asList(3L));

        List<DoctorsDTO> doctorsList = Arrays.asList(doctor1, doctor2);

        // Configurar el comportamiento del mock
        org.mockito.Mockito.when(doctorsService.findAll()).thenReturn(doctorsList);

        // Act & Assert
        mockMvc.perform(get("/api/v3/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].doctorId").value(1L))
                .andExpect(jsonPath("$[0].medicalLicenseNumber").value("LIC-12345"))
                .andExpect(jsonPath("$[1].doctorId").value(2L))
                .andExpect(jsonPath("$[1].medicalLicenseNumber").value("LIC-67890"));
    }

    @Test
    void getDoctorById_ShouldReturnDoctor_WhenExists() throws Exception {
        // Arrange
        Long doctorId = 1L;
        DoctorsDTO doctor = new DoctorsDTO();
        doctor.setDoctorId(doctorId);
        doctor.setUserId(100L);
        doctor.setMedicalLicenseNumber("LIC-12345");
        doctor.setActive(true);
        doctor.setSpecialtyIds(Arrays.asList(1L, 2L));

        org.mockito.Mockito.when(doctorsService.findById(doctorId)).thenReturn(doctor);

        // Act & Assert
        mockMvc.perform(get("/api/v3/doctors/{id}", doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(1L))
                .andExpect(jsonPath("$.medicalLicenseNumber").value("LIC-12345"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void getDoctorById_ShouldReturnNotFound_WhenDoctorDoesNotExist() throws Exception {
        // Arrange
        Long doctorId = 999L;
        org.mockito.Mockito.when(doctorsService.findById(doctorId))
                .thenThrow(new RuntimeException("Doctor no encontrado"));

        // Act & Assert
        mockMvc.perform(get("/api/v3/doctors/{id}", doctorId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Doctor no encontrado"));
    }

    @Test
    void createDoctor_ShouldReturnCreatedDoctor() throws Exception {
        // Arrange
        DoctorsDTO input = new DoctorsDTO();
        input.setUserId(100L);
        input.setMedicalLicenseNumber("LIC-12345");
        input.setSpecialtyIds(Arrays.asList(1L, 2L));

        DoctorsDTO output = new DoctorsDTO();
        output.setDoctorId(1L);
        output.setUserId(100L);
        output.setMedicalLicenseNumber("LIC-12345");
        output.setActive(true);
        output.setSpecialtyIds(Arrays.asList(1L, 2L));

        org.mockito.Mockito.when(doctorsService.save(org.mockito.ArgumentMatchers.any(DoctorsDTO.class)))
                .thenReturn(output);

        // Act & Assert
        mockMvc.perform(post("/api/v3/doctors")
        .contentType("application/json")
        .content("""
                {
                    "userId": 100,
                    "medicalLicenseNumber": "LIC-12345",
                    "specialtyIds": [1, 2],
                    "active": true
                }
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.doctorId").value(1L))
                .andExpect(jsonPath("$.medicalLicenseNumber").value("LIC-12345"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void updateDoctor_ShouldReturnUpdatedDoctor() throws Exception {
        // Arrange
        Long doctorId = 1L;
        DoctorsDTO output = new DoctorsDTO();
        output.setDoctorId(doctorId);
        output.setUserId(200L);
        output.setMedicalLicenseNumber("LIC-UPDATED");
        output.setActive(true);
        output.setSpecialtyIds(Arrays.asList(1L, 2L, 3L));

        org.mockito.Mockito.when(doctorsService.update(org.mockito.ArgumentMatchers.eq(doctorId),
                org.mockito.ArgumentMatchers.any(DoctorsDTO.class)))
                .thenReturn(output);

        // Act & Assert
        mockMvc.perform(put("/api/v3/doctors/{id}", doctorId)
                .contentType("application/json")
                .content("""
                        {
                            "userId": 200,
                            "medicalLicenseNumber": "LIC-UPDATED",
                            "active": true,
                            "specialtyIds": [1, 2, 3]
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(1L))
                .andExpect(jsonPath("$.medicalLicenseNumber").value("LIC-UPDATED"))
                .andExpect(jsonPath("$.specialtyIds.length()").value(3));
    }

    @Test
    void deleteDoctor_ShouldReturnNoContent() throws Exception {
        // Arrange
        Long doctorId = 1L;
        org.mockito.Mockito.doNothing().when(doctorsService).delete(doctorId);

        // Act & Assert
        mockMvc.perform(delete("/api/v3/doctors/{id}", doctorId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteDoctor_ShouldReturnNotFound_WhenDoctorDoesNotExist() throws Exception {
        // Arrange
        Long doctorId = 999L;
        org.mockito.Mockito.doThrow(new RuntimeException("Doctor no encontrado"))
                .when(doctorsService).delete(doctorId);

        // Act & Assert
        mockMvc.perform(delete("/api/v3/doctors/{id}", doctorId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Doctor no encontrado"));
    }
}