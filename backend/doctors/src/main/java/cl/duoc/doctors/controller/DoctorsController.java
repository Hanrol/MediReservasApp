package cl.duoc.doctors.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cl.duoc.doctors.dto.DoctorsDTO;
import cl.duoc.doctors.dto.ApiResponse;
import cl.duoc.doctors.dto.DoctorOnboardingRequestDTO;
import cl.duoc.doctors.service.DoctorsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v3/doctors")
@Tag(name = "Doctors Controller", description = "Endpoints para la gestión de médicos y sus especialidades")
public class DoctorsController {
    
    private final DoctorsService doctorsService;

    public DoctorsController(DoctorsService doctorsService) {
        this.doctorsService = doctorsService;
    }

    @GetMapping
    @Operation(summary = "Obtener todos los doctores", description = "Retorna una lista con todos los doctores registrados.")
    public ResponseEntity<List<DoctorsDTO>> getAllDoctors() {
        List<DoctorsDTO> doctors = doctorsService.findAll();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un doctor por su ID", description = "Busca y retorna el perfil de un doctor específico utilizando su ID único.")
    public ResponseEntity<DoctorsDTO> getDoctorById(@PathVariable Long id) {
        DoctorsDTO doctor = doctorsService.findById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorsDTO> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorsService.findByUserId(userId));
    }

    @GetMapping("/user/{userId}/exists")
    public ResponseEntity<Boolean> doctorProfileExists(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorsService.existsByUserId(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<DoctorsDTO> getOwnDoctorProfile(
            @RequestHeader("X-Authenticated-Email") String authenticatedEmail,
            @RequestHeader("X-Authenticated-Roles") String authenticatedRoles) {
        requireDoctorRole(authenticatedRoles);
        return ResponseEntity.ok(doctorsService.findByUserId(
                doctorsService.getUserIdByEmail(authenticatedEmail)));
    }

    @PostMapping("/me")
    public ResponseEntity<ApiResponse<DoctorsDTO>> createOwnDoctorProfile(
            @RequestHeader("X-Authenticated-Email") String authenticatedEmail,
            @RequestHeader("X-Authenticated-Roles") String authenticatedRoles,
            @jakarta.validation.Valid @RequestBody DoctorOnboardingRequestDTO request) {
        requireDoctorRole(authenticatedRoles);
        DoctorsDTO response = doctorsService.createOwnProfile(authenticatedEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Perfil profesional creado correctamente", response));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo doctor", description = "Registra un nuevo médico en el sistema de forma activa.")
    public ResponseEntity<DoctorsDTO> createDoctor(@RequestBody DoctorsDTO doctorsDTO) {
        DoctorsDTO createdDoctor = doctorsService.save(doctorsDTO);
        return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
    }

    private void requireDoctorRole(String roles) {
        boolean isDoctor = java.util.Arrays.stream(roles.split(","))
                .map(String::trim)
                .anyMatch("DOCTOR"::equalsIgnoreCase);
        if (!isDoctor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un usuario con rol médico puede completar este perfil");
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un doctor existente", description = "Modifica los datos de un médico y actualiza su lista de especialidades asociadas.")
    public ResponseEntity<DoctorsDTO> updateDoctor(@PathVariable Long id, @RequestBody DoctorsDTO doctorsDTO) {
        DoctorsDTO updatedDoctor = doctorsService.update(id, doctorsDTO);
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar de forma lógica un doctor", description = "Cambia el estado del médico a 'inactivo' sin borrarlo físicamente de la base de datos.")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
