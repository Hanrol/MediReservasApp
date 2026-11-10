package cl.duoc.specialties.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.duoc.specialties.dto.CreateSpecialtyRequestDTO;
import cl.duoc.specialties.dto.SpecialtyResponseDTO;
import cl.duoc.specialties.service.SpecialtyService;

@ExtendWith(MockitoExtension.class)
class SpecialtyControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private SpecialtyService specialtyService;

    @InjectMocks
    private SpecialtyController specialtyController;

    private SpecialtyResponseDTO specialtyResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(specialtyController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        specialtyResponse = new SpecialtyResponseDTO(
                1L,
                "Cardiología",
                "Especialidad médica del corazón",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0));
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createSpecialty_deberiaRetornar201() throws Exception {
        CreateSpecialtyRequestDTO request = new CreateSpecialtyRequestDTO(
                "Cardiología",
                "Especialidad médica del corazón");

        when(specialtyService.createSpecialty(any(CreateSpecialtyRequestDTO.class)))
                .thenReturn(specialtyResponse);

        mockMvc.perform(post("/api/v3/specialties")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad creada correctamente"))
                .andExpect(jsonPath("$.data.specialtyId").value(1))
                .andExpect(jsonPath("$.data.specialtyName")
                        .value("Cardiología"))
                .andExpect(jsonPath("$.data.description")
                        .value("Especialidad médica del corazón"))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(specialtyService)
                .createSpecialty(any(CreateSpecialtyRequestDTO.class));
    }

    @Test
    void createSpecialty_deberiaRetornar400CuandoNombreVieneVacio()
            throws Exception {

        String json = """
                {
                    "specialtyName": "",
                    "description": "Especialidad médica del corazón"
                }
                """;

        mockMvc.perform(post("/api/v3/specialties")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // GET
    // =========================================================

    @Test
    void getAllSpecialties_deberiaRetornarLista() throws Exception {
        when(specialtyService.getAllSpecialties())
                .thenReturn(List.of(specialtyResponse));

        mockMvc.perform(get("/api/v3/specialties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidades obtenidas correctamente"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].specialtyId").value(1))
                .andExpect(jsonPath("$.data[0].specialtyName")
                        .value("Cardiología"));

        verify(specialtyService)
                .getAllSpecialties();
    }

    @Test
    void getSpecialtyById_deberiaRetornarEspecialidad() throws Exception {
        when(specialtyService.getSpecialtyById(1L))
                .thenReturn(specialtyResponse);

        mockMvc.perform(get("/api/v3/specialties/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad obtenida correctamente"))
                .andExpect(jsonPath("$.data.specialtyId").value(1))
                .andExpect(jsonPath("$.data.specialtyName")
                        .value("Cardiología"))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(specialtyService)
                .getSpecialtyById(1L);
    }

    @Test
    void getSpecialtyByName_deberiaRetornarEspecialidad() throws Exception {
        when(specialtyService.getSpecialtyByName("Cardiología"))
                .thenReturn(specialtyResponse);

        mockMvc.perform(get("/api/v3/specialties/name/Cardiología"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad obtenida correctamente por nombre"))
                .andExpect(jsonPath("$.data.specialtyName")
                        .value("Cardiología"));

        verify(specialtyService)
                .getSpecialtyByName("Cardiología");
    }

    // =========================================================
    // EXISTS
    // =========================================================

    @Test
    void existsById_deberiaRetornarTrue() throws Exception {
        when(specialtyService.existsById(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/specialties/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(specialtyService)
                .existsById(1L);
    }

    @Test
    void existsActiveById_deberiaRetornarTrue() throws Exception {
        when(specialtyService.existsActiveById(1L))
                .thenReturn(true);

        mockMvc.perform(get("/api/v3/specialties/1/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Validación de especialidad activa realizada correctamente"))
                .andExpect(jsonPath("$.data").value(true));

        verify(specialtyService)
                .existsActiveById(1L);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateSpecialty_deberiaRetornar200() throws Exception {
        CreateSpecialtyRequestDTO request = new CreateSpecialtyRequestDTO(
                "Medicina General",
                "Atención médica general");

        SpecialtyResponseDTO updatedResponse = new SpecialtyResponseDTO(
                1L,
                "Medicina General",
                "Atención médica general",
                true,
                LocalDateTime.of(2026, 6, 18, 12, 0));

        when(specialtyService.updateSpecialty(
                any(Long.class),
                any(CreateSpecialtyRequestDTO.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v3/specialties/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad actualizada correctamente"))
                .andExpect(jsonPath("$.data.specialtyId").value(1))
                .andExpect(jsonPath("$.data.specialtyName")
                        .value("Medicina General"))
                .andExpect(jsonPath("$.data.description")
                        .value("Atención médica general"));

        verify(specialtyService)
                .updateSpecialty(
                        any(Long.class),
                        any(CreateSpecialtyRequestDTO.class));
    }

    @Test
    void updateSpecialty_deberiaRetornar400CuandoNombreVieneVacio()
            throws Exception {

        String json = """
                {
                    "specialtyName": "",
                    "description": "Atención médica general"
                }
                """;

        mockMvc.perform(put("/api/v3/specialties/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @Test
    void deactivateSpecialty_deberiaRetornar200() throws Exception {
        SpecialtyResponseDTO inactiveResponse = new SpecialtyResponseDTO(
                1L,
                "Cardiología",
                "Especialidad médica del corazón",
                false,
                LocalDateTime.of(2026, 6, 18, 12, 0));

        when(specialtyService.deactivateSpecialty(1L))
                .thenReturn(inactiveResponse);

        mockMvc.perform(patch("/api/v3/specialties/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad desactivada correctamente"))
                .andExpect(jsonPath("$.data.specialtyId").value(1))
                .andExpect(jsonPath("$.data.active").value(false));

        verify(specialtyService)
                .deactivateSpecialty(1L);
    }

    @Test
    void activateSpecialty_deberiaRetornar200() throws Exception {
        when(specialtyService.activateSpecialty(1L))
                .thenReturn(specialtyResponse);

        mockMvc.perform(patch("/api/v3/specialties/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message")
                        .value("Especialidad activada correctamente"))
                .andExpect(jsonPath("$.data.specialtyId").value(1))
                .andExpect(jsonPath("$.data.active").value(true));

        verify(specialtyService)
                .activateSpecialty(1L);
    }
}