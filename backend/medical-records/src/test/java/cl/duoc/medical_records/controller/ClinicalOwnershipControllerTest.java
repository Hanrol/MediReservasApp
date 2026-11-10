package cl.duoc.medical_records.controller;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.springframework.http.MediaType;
import java.time.LocalDateTime;
import java.util.List;

import cl.duoc.medical_records.dto.MedicalVisitDetailReponseDTO;
import cl.duoc.medical_records.dto.MedicalVisitResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.medical_records.security.ClinicalOwnershipVerifier;
import cl.duoc.medical_records.service.DiagnosesService;
import cl.duoc.medical_records.service.MedicalVisitService;
import cl.duoc.medical_records.service.VitalSignsService;

class ClinicalOwnershipControllerTest {
    private static final String EMAIL = "doctor@example.test";
    private static final String DOCTOR = "DOCTOR";

    @Test
    void medicalVisitEndpointReturnsForbiddenBeforeReadingForeignVisit() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVisit(71L, EMAIL, java.util.Set.of(DOCTOR));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

        mvc.perform(get("/api/v3/medical-visit/detail/71")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).findDetailById(71L);
    }

    @Test
    void diagnosisEndpointReturnsForbiddenBeforeReadingForeignDiagnosis() throws Exception {
        DiagnosesService service = org.mockito.Mockito.mock(DiagnosesService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireDiagnosis(81L, EMAIL, java.util.Set.of(DOCTOR));
        DiagnosesController controller = new DiagnosesController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

        mvc.perform(get("/api/v3/diagnoses/81")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).findById(81L);
    }

    @Test
    void vitalSignEndpointReturnsForbiddenBeforeReadingForeignVitalSign() throws Exception {
        VitalSignsService service = org.mockito.Mockito.mock(VitalSignsService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVitalSign(91L, EMAIL, java.util.Set.of(DOCTOR));
        VitalSignsController controller = new VitalSignsController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

        mvc.perform(get("/api/v3/vital-signs/91")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).findById(91L);
    }

    @Test
    void medicalVisitDeleteReturnsForbiddenBeforeMutation() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVisit(71L, EMAIL, java.util.Set.of(DOCTOR));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(delete("/api/v3/medical-visit/71")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).delete(71L);
    }

    @Test
    void diagnosisDeleteReturnsForbiddenBeforeMutation() throws Exception {
        DiagnosesService service = org.mockito.Mockito.mock(DiagnosesService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireDiagnosis(81L, EMAIL, java.util.Set.of(DOCTOR));
        DiagnosesController controller = new DiagnosesController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(delete("/api/v3/diagnoses/81")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).delete(81L);
    }

    @Test
    void vitalSignDeleteReturnsForbiddenBeforeMutation() throws Exception {
        VitalSignsService service = org.mockito.Mockito.mock(VitalSignsService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVitalSign(91L, EMAIL, java.util.Set.of(DOCTOR));
        VitalSignsController controller = new VitalSignsController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(delete("/api/v3/vital-signs/91")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isForbidden());

        verify(service, never()).delete(91L);
    }

    @Test
    void medicalVisitCreateReturnsForbiddenBeforeCreationForAnotherDoctor() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireDoctor(33L, EMAIL, java.util.Set.of(DOCTOR));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(post("/api/v3/medical-visit")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"medicalRecordId":80,"appointmentId":55,"doctorId":33,
                                 "visitDate":"2025-01-01 10:00:00","visitReason":"consulta",
                                 "observations":"","treatment":"tratamiento"}
                                """))
                .andExpect(status().isForbidden());

        verify(service, never()).create(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void diagnosisCreateReturnsForbiddenBeforeCreationForForeignVisit() throws Exception {
        DiagnosesService service = org.mockito.Mockito.mock(DiagnosesService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVisit(71L, EMAIL, java.util.Set.of(DOCTOR));
        DiagnosesController controller = new DiagnosesController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(post("/api/v3/diagnoses")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"medicalVisitId":71,"diagnosisDescription":"diagnóstico",
                                 "diagnosisNotes":"notas"}
                                """))
                .andExpect(status().isForbidden());

        verify(service, never()).create(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void vitalSignCreateReturnsForbiddenBeforeCreationForForeignVisit() throws Exception {
        VitalSignsService service = org.mockito.Mockito.mock(VitalSignsService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVisit(71L, EMAIL, java.util.Set.of(DOCTOR));
        VitalSignsController controller = new VitalSignsController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(post("/api/v3/vital-signs")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"medicalVisitId":71,"temperature":36.5,"bloodPressure":"120/80",
                                 "heartRate":72,"weight":70.0,"height":170.0}
                                """))
                .andExpect(status().isForbidden());

        verify(service, never()).create(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void medicalVisitUpdateReturnsForbiddenBeforeMutationForForeignVisit() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVisit(71L, EMAIL, java.util.Set.of(DOCTOR));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(put("/api/v3/medical-visit/71")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitReason\":\"actualizado\",\"observations\":\"\",\"treatment\":\"tratamiento\"}"))
                .andExpect(status().isForbidden());

        verify(service, never()).update(org.mockito.ArgumentMatchers.eq(71L), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void diagnosisUpdateReturnsForbiddenBeforeMutationForForeignDiagnosis() throws Exception {
        DiagnosesService service = org.mockito.Mockito.mock(DiagnosesService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireDiagnosis(81L, EMAIL, java.util.Set.of(DOCTOR));
        DiagnosesController controller = new DiagnosesController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(put("/api/v3/diagnoses/81")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"diagnosisDescription\":\"actualizado\",\"diagnosisNotes\":\"notas\"}"))
                .andExpect(status().isForbidden());

        verify(service, never()).update(org.mockito.ArgumentMatchers.eq(81L), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void vitalSignUpdateReturnsForbiddenBeforeMutationForForeignVitalSign() throws Exception {
        VitalSignsService service = org.mockito.Mockito.mock(VitalSignsService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(verifier).requireVitalSign(91L, EMAIL, java.util.Set.of(DOCTOR));
        VitalSignsController controller = new VitalSignsController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(put("/api/v3/vital-signs/91")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"temperature\":36.5,\"bloodPressure\":\"120/80\",\"heartRate\":72,\"weight\":70.0,\"height\":170.0}"))
                .andExpect(status().isForbidden());

        verify(service, never()).update(org.mockito.ArgumentMatchers.eq(91L), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void patientVisitListContainsOnlyVisitsOwnedByAuthenticatedDoctor() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.when(verifier.authenticatedDoctorId(EMAIL)).thenReturn(31L);
        org.mockito.Mockito.when(service.findAllByPatientId(101L)).thenReturn(List.of(
                visitDetail(1L, 31L), visitDetail(2L, 32L), visitDetail(3L, null)));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(get("/api/v3/medical-visit/101")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].doctorId").value(31));
    }

    @Test
    void recordVisitListContainsOnlyVisitsOwnedByAuthenticatedDoctor() throws Exception {
        MedicalVisitService service = org.mockito.Mockito.mock(MedicalVisitService.class);
        ClinicalOwnershipVerifier verifier = org.mockito.Mockito.mock(ClinicalOwnershipVerifier.class);
        org.mockito.Mockito.when(verifier.authenticatedDoctorId(EMAIL)).thenReturn(31L);
        org.mockito.Mockito.when(service.findByMedicalRecordId(80L)).thenReturn(List.of(
                visitResponse(1L, 31L), visitResponse(2L, 32L), visitResponse(3L, null)));
        MedicalVisitController controller = new MedicalVisitController(service);
        ReflectionTestUtils.setField(controller, "ownershipVerifier", verifier);

        MockMvcBuilders.standaloneSetup(controller).build()
                .perform(get("/api/v3/medical-visit/record/80")
                        .header("X-Authenticated-Email", EMAIL)
                        .header("X-Authenticated-Roles", DOCTOR))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].doctorId").value(31));

        verify(verifier).requireMedicalRecord(80L, EMAIL, java.util.Set.of(DOCTOR));
    }

    private MedicalVisitDetailReponseDTO visitDetail(Long id, Long doctorId) {
        return new MedicalVisitDetailReponseDTO(id, id + 100, doctorId, LocalDateTime.now(),
                "consulta", "observaciones", "tratamiento", LocalDateTime.now(), List.of(), List.of());
    }

    private MedicalVisitResponseDTO visitResponse(Long id, Long doctorId) {
        return new MedicalVisitResponseDTO(id, 80L, id + 100, doctorId, LocalDateTime.now(),
                "consulta", "observaciones", "tratamiento", LocalDateTime.now());
    }
}
