package cl.duoc.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.PatientRegistrationRequestDTO;
import cl.duoc.users.dto.PatientRegistrationResponseDTO;
import cl.duoc.users.service.PatientRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v3/patient-registrations")
@RequiredArgsConstructor
@Tag(name = "Patient Registration", description = "Registro público de pacientes")
public class PatientRegistrationController {

    private final PatientRegistrationService patientRegistrationService;

    @PostMapping
    @Operation(summary = "Registrar paciente", description = "Crea una cuenta Auth y sus perfiles de paciente. El rol PATIENT se asigna exclusivamente en el backend.")
    public ResponseEntity<ApiResponse<PatientRegistrationResponseDTO>> registerPatient(
            @Valid @RequestBody PatientRegistrationRequestDTO request) {
        PatientRegistrationResponseDTO response = patientRegistrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Cuenta creada correctamente", response));
    }
}
