package cl.duoc.appointments.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.DoctorTimeOffRequest;
import cl.duoc.appointments.dto.DoctorTimeOffResponse;
import cl.duoc.appointments.model.DoctorTimeOff;
import cl.duoc.appointments.repository.DoctorTimeOffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorTimeOffService {

    private final DoctorTimeOffRepository doctorTimeOffRepository;
    private final DoctorsClient doctorsClient;

    public DoctorTimeOffResponse create(DoctorTimeOffRequest request) {
        log.info("Iniciando creación de permiso (time off) para doctorId: {}", request.getDoctorId());
        
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorTimeOff timeOff = new DoctorTimeOff();
        timeOff.setDoctorId(request.getDoctorId());
        timeOff.setStartDate(request.getStartDate());
        timeOff.setEndDate(request.getEndDate());
        timeOff.setReason(request.getReason());
        timeOff.setActive(request.getActive());
        timeOff.setCreatedAt(LocalDateTime.now());

        DoctorTimeOff saved = doctorTimeOffRepository.save(timeOff);
        log.info("Permiso creado exitosamente con ID: {}", saved.getDoctorTimeOffId());
        
        return mapToResponse(saved);
    }

    public DoctorTimeOffResponse findById(Long id) {
        log.info("Buscando permiso de doctor con ID: {}", id);
        
        DoctorTimeOff timeOff = doctorTimeOffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time off no encontrado con ID: " + id));
                
        return mapToResponse(timeOff);
    }

    public List<DoctorTimeOffResponse> findAll() {
        log.info("Obteniendo todos los permisos de doctores");
        
        return doctorTimeOffRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DoctorTimeOffResponse update(Long id, DoctorTimeOffRequest request) {
        log.info("Iniciando actualización de permiso ID: {} para doctorId: {}", id, request.getDoctorId());
        
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorTimeOff timeOff = doctorTimeOffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time off no encontrado con ID: " + id));

        timeOff.setDoctorId(request.getDoctorId());
        timeOff.setStartDate(request.getStartDate());
        timeOff.setEndDate(request.getEndDate());
        timeOff.setReason(request.getReason());
        timeOff.setActive(request.getActive());

        DoctorTimeOff updated = doctorTimeOffRepository.save(timeOff);
        log.info("Permiso ID: {} actualizado exitosamente", updated.getDoctorTimeOffId());
        
        return mapToResponse(updated);
    }

    public void delete(Long id) {
        log.info("Iniciando eliminación de permiso con ID: {}", id);
        
        if (!doctorTimeOffRepository.existsById(id)) {
            throw new RuntimeException("Time off no encontrado con ID: " + id);
        }
        doctorTimeOffRepository.deleteById(id);
        
        log.info("Permiso con ID: {} eliminado exitosamente", id);
    }

    private DoctorTimeOffResponse mapToResponse(DoctorTimeOff timeOff) {
        return new DoctorTimeOffResponse(
                timeOff.getDoctorTimeOffId(),
                timeOff.getDoctorId(),
                timeOff.getStartDate(),
                timeOff.getEndDate(),
                timeOff.getReason(),
                timeOff.getActive(),
                timeOff.getCreatedAt()
        );
    }
}