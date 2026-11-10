package cl.duoc.doctors.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import cl.duoc.doctors.dto.CreateSpecialtyRequestDTO;
import cl.duoc.doctors.dto.SpecialtyResponseDTO;
import cl.duoc.doctors.model.Specialty;
import cl.duoc.doctors.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private static final Logger logger = LoggerFactory.getLogger(SpecialtyService.class);

    public SpecialtyResponseDTO createSpecialty(CreateSpecialtyRequestDTO request) {

        if (specialtyRepository.existsBySpecialtyName(request.specialtyName())) {
            logger.warn("Creación de especialidad rechazada: ya existe especialidad con nombre {}",
                    request.specialtyName());
            throw new RuntimeException("Ya existe una especialidad con ese nombre");
        }

        Specialty specialty = new Specialty();
        specialty.setSpecialtyName(request.specialtyName());
        specialty.setDescription(request.description());
        specialty.setActive(true);

        Specialty savedSpecialty = specialtyRepository.save(specialty);

        return toResponseDTO(savedSpecialty);
    }

    public List<SpecialtyResponseDTO> getAllSpecialties() {
        return specialtyRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public SpecialtyResponseDTO getSpecialtyById(Long specialtyId) {
        Specialty specialty = findSpecialtyEntityById(specialtyId);
        return toResponseDTO(specialty);
    }

    public SpecialtyResponseDTO getSpecialtyByName(String specialtyName) {
        Specialty specialty = specialtyRepository.findBySpecialtyName(specialtyName)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: especialidad no encontrada con nombre {}", specialtyName);
                    return new RuntimeException("Especialidad no encontrada");
                });

        return toResponseDTO(specialty);
    }

    public boolean existsById(Long specialtyId) {
        return specialtyRepository.existsById(specialtyId);
    }

    public boolean existsActiveById(Long specialtyId) {
        return specialtyRepository.existsBySpecialtyIdAndActiveTrue(specialtyId);
    }

    public SpecialtyResponseDTO deactivateSpecialty(Long specialtyId) {
        Specialty specialty = findSpecialtyEntityById(specialtyId);

        if (!specialty.isActive()) {
            logger.warn("Desactivación rechazada: especialidad ya estaba desactivada. specialtyId={}", specialtyId);
            throw new RuntimeException("La especialidad ya está desactivada");
        }

        specialty.setActive(false);

        Specialty savedSpecialty = specialtyRepository.save(specialty);

        return toResponseDTO(savedSpecialty);
    }

    public Specialty findSpecialtyEntityById(Long specialtyId) {
        return specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> {
                    logger.warn("Búsqueda rechazada: especialidad no encontrada con ID {}", specialtyId);
                    return new RuntimeException("Especialidad no encontrada");
                });
    }

    public SpecialtyResponseDTO updateSpecialty(Long specialtyId, CreateSpecialtyRequestDTO request) {
        Specialty specialty = findSpecialtyEntityById(specialtyId);

        if (!specialty.getSpecialtyName().equalsIgnoreCase(request.specialtyName())
                && specialtyRepository.existsBySpecialtyName(request.specialtyName())) {
            logger.warn("Actualización rechazada: ya existe especialidad con nombre {}", request.specialtyName());
            throw new RuntimeException("Ya existe una especialidad con ese nombre");
        }

        specialty.setSpecialtyName(request.specialtyName());
        specialty.setDescription(request.description());

        Specialty savedSpecialty = specialtyRepository.save(specialty);

        return toResponseDTO(savedSpecialty);
    }

    public SpecialtyResponseDTO activateSpecialty(Long specialtyId) {
        Specialty specialty = findSpecialtyEntityById(specialtyId);

        if (specialty.isActive()) {
            logger.warn("Activación rechazada: especialidad ya estaba activada. specialtyId={}", specialtyId);
            throw new RuntimeException("La especialidad ya está activada");
        }

        specialty.setActive(true);

        Specialty savedSpecialty = specialtyRepository.save(specialty);

        return toResponseDTO(savedSpecialty);
    }

    private SpecialtyResponseDTO toResponseDTO(Specialty specialty) {
        return new SpecialtyResponseDTO(
                specialty.getSpecialtyId(),
                specialty.getSpecialtyName(),
                specialty.getDescription(),
                specialty.isActive(),
                specialty.getCreatedAt());
    }
}