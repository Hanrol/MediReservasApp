package cl.duoc.doctors.service;

import java.util.List;
import org.springframework.stereotype.Service;

import cl.duoc.doctors.client.AuthClient;
import cl.duoc.doctors.client.UsersClient;
import cl.duoc.doctors.dto.DoctorsDTO;
import cl.duoc.doctors.dto.DoctorOnboardingRequestDTO;
import cl.duoc.doctors.dto.UserInternalResponseDTO;
import cl.duoc.doctors.model.DoctorSpecialties;
import cl.duoc.doctors.model.Doctors;
import cl.duoc.doctors.model.Specialty;
import cl.duoc.doctors.repository.DoctorsRepository;
import cl.duoc.doctors.repository.DoctorsSpecialtiesRepository;
import cl.duoc.doctors.repository.SpecialtyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorsService {

    private final UsersClient usersClient;
    private final AuthClient authClient;
    private final DoctorsRepository doctorsRepository;
    private final DoctorsSpecialtiesRepository doctorSpecialtiesRepository;
    private final SpecialtyRepository specialtyRepository;

    public List<DoctorsDTO> findAll() {
        log.info("Solicitando listado completo de doctores");
        return doctorsRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    public DoctorsDTO findById(Long id) {
        log.info("Buscando doctor con ID: {}", id);
        Doctors doctor = doctorsRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Error: No se encontró el doctor con ID: {}", id);
                    return new RuntimeException("Doctor no encontrado");
                });
        return convertToDTO(doctor);
    }

    public DoctorsDTO findByUserId(Long userId) {
        Doctors doctor = doctorsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Perfil profesional de doctor no encontrado"));
        return convertToDTO(doctor);
    }

    public boolean existsByUserId(Long userId) {
        return doctorsRepository.existsByUserId(userId);
    }

    public Long getUserIdByEmail(String email) {
        return usersClient.getUserByEmail(email).userId();
    }

    @Transactional
    public DoctorsDTO createOwnProfile(String authenticatedEmail, DoctorOnboardingRequestDTO request) {
        UserInternalResponseDTO user = usersClient.getUserByEmail(authenticatedEmail);
        DoctorsDTO dto = new DoctorsDTO();
        dto.setUserId(user.userId());
        dto.setMedicalLicenseNumber(request.medicalLicenseNumber().trim());
        dto.setSpecialtyIds(request.specialtyIds());
        return save(dto);
    }

    @Transactional
    public DoctorsDTO save(DoctorsDTO dto) {

        if (dto.getUserId() == null) {
            throw new RuntimeException("El ID del usuario es obligatorio");
        }

        if (doctorsRepository.existsByUserId(dto.getUserId())) {
            throw new RuntimeException("El usuario ya tiene un perfil de doctor");
        }

        if (doctorsRepository.existsByMedicalLicenseNumber(dto.getMedicalLicenseNumber())) {
            throw new RuntimeException("Ya existe un doctor con ese número de licencia");
        }

        UserInternalResponseDTO user = usersClient.getUserById(dto.getUserId());

        if (!user.active()) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        if (!usersClient.hasGeneralProfile(dto.getUserId())) {
            throw new RuntimeException("El usuario debe tener un perfil general antes de crear el perfil de doctor");
        }

        if (usersClient.hasPatientProfile(dto.getUserId())) {
            throw new RuntimeException("El usuario ya tiene un perfil de paciente");
        }

        if (usersClient.hasReceptionistProfile(dto.getUserId())) {
            throw new RuntimeException("El usuario ya tiene un perfil de recepcionista");
        }

        if (usersClient.hasAdministratorProfile(dto.getUserId())) {
            throw new RuntimeException("El usuario ya tiene un perfil de administrador");
        }

        if (dto.getSpecialtyIds() == null || dto.getSpecialtyIds().isEmpty()) {
            throw new RuntimeException("El doctor debe tener al menos una especialidad");
        }

        List<Long> specialtyIds = dto.getSpecialtyIds().stream().distinct().toList();

        List<Specialty> specialties = specialtyIds.stream()
                .map(id -> specialtyRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException(
                                "Especialidad no encontrada con ID: " + id)))
                .toList();

        for (Specialty specialty : specialties) {
            if (!specialty.isActive()) {
                throw new RuntimeException(
                        "La especialidad está inactiva. ID: " + specialty.getSpecialtyId());
            }
        }

        Doctors doctor = new Doctors();
        doctor.setUserId(user.userId());
        doctor.setMedicalLicenseNumber(dto.getMedicalLicenseNumber());
        doctor.setActive(true);
        doctor.setCreatedAt(new java.sql.Date(System.currentTimeMillis()));

        Doctors savedDoctor = doctorsRepository.save(doctor);

        saveDoctorSpecialties(savedDoctor, specialties);

        authClient.assignDoctorRole(user.authUserId());

        return convertToDTO(savedDoctor);
    }

    @Transactional
    public void delete(Long id) {
        log.warn("Se ha solicitado la desactivación (eliminación lógica) del doctor ID: {}", id);
        Doctors doctor = doctorsRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Fallo al intentar eliminar: Doctor ID {} no existe", id);
                    return new RuntimeException("Doctor no encontrado");
                });
        doctor.setActive(false);
        doctorsRepository.save(doctor);
        log.info("Doctor ID: {} desactivado correctamente", id);
    }

    @Transactional
    public DoctorsDTO update(Long id, DoctorsDTO dto) {
        log.info("Iniciando actualización para el doctor ID: {}", id);
        Doctors doctor = doctorsRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Fallo al intentar actualizar: Doctor ID {} no existe", id);
                    return new RuntimeException("Doctor no encontrado");
                });

        doctor.setUserId(dto.getUserId());
        doctor.setActive(dto.isActive());
        doctor.setMedicalLicenseNumber(dto.getMedicalLicenseNumber());
        doctorSpecialtiesRepository.deleteByDoctor(doctor);

        if (dto.getSpecialtyIds() != null) {
            List<Long> specialtyIds = dto.getSpecialtyIds().stream().distinct().toList();

            List<Specialty> specialties = specialtyIds.stream()
                    .map(sid -> specialtyRepository.findById(sid)
                            .orElseThrow(() -> new RuntimeException(
                                    "Especialidad no encontrada con ID: " + sid)))
                    .toList();

            log.info("Asociando {} especialidades al doctor ID: {}", specialties.size(), id);
            saveDoctorSpecialties(doctor, specialties);
        }

        Doctors updatedDoctor = doctorsRepository.save(doctor);
        log.info("Doctor ID: {} actualizado con éxito", id);
        return convertToDTO(updatedDoctor);
    }

    private void saveDoctorSpecialties(Doctors doctor, List<Specialty> specialties) {

        List<DoctorSpecialties> relations = specialties.stream()
                .map(specialty -> {
                    DoctorSpecialties relation = new DoctorSpecialties();
                    relation.setDoctor(doctor);
                    relation.setSpecialty(specialty);
                    relation.setPrimary(false);
                    return relation;
                })
                .toList();

        List<DoctorSpecialties> savedRelations = doctorSpecialtiesRepository.saveAll(relations);

        doctor.setSpecialties(savedRelations);
    }

    private DoctorsDTO convertToDTO(Doctors doctor) {
        DoctorsDTO dto = new DoctorsDTO();
        dto.setDoctorId(doctor.getDoctorId());
        dto.setUserId(doctor.getUserId());
        dto.setMedicalLicenseNumber(doctor.getMedicalLicenseNumber());
        dto.setActive(doctor.getActive());

        if (doctor.getSpecialties() != null) {
            List<Long> ids = doctor.getSpecialties().stream()
                    .map(ds -> ds.getSpecialty().getSpecialtyId())
                    .toList();
            dto.setSpecialtyIds(ids);
        }
        return dto;
    }
}
