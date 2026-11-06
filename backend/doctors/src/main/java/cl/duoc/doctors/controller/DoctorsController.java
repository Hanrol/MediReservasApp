package cl.duoc.doctors.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cl.duoc.doctors.dto.DoctorsDTO;
import cl.duoc.doctors.service.DoctorsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

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

    @PostMapping
    @Operation(summary = "Crear un nuevo doctor", description = "Registra un nuevo médico en el sistema de forma activa.")
    public ResponseEntity<DoctorsDTO> createDoctor(@RequestBody DoctorsDTO doctorsDTO) {
        DoctorsDTO createdDoctor = doctorsService.save(doctorsDTO);
        return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
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