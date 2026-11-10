package cl.duoc.appointments.service;

import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.dto.DoctorScheduleRequest;
import cl.duoc.appointments.dto.DoctorScheduleResponse;
import cl.duoc.appointments.model.DoctorSchedule;
import cl.duoc.appointments.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    @Autowired
    private DoctorOwnershipVerifier ownershipVerifier;

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorsClient doctorsClient;

    public DoctorScheduleResponse create(DoctorScheduleRequest request) {
        
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctorId(request.getDoctorId());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setActive(request.getActive());

        DoctorSchedule saved = doctorScheduleRepository.save(schedule);
        return mapToResponse(saved);
    }

    public DoctorScheduleResponse create(DoctorScheduleRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return create(request);
    }

    public DoctorScheduleResponse findById(Long id) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario de doctor no encontrado con ID: " + id));
        return mapToResponse(schedule);
    }

    public DoctorScheduleResponse findById(Long id, String email, Set<String> roles) {
        DoctorScheduleResponse response = findById(id);
        ownershipVerifier.requireOwnDoctor(email, response.doctorId(), roles);
        return response;
    }

    public List<DoctorScheduleResponse> findAll() {
        return doctorScheduleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DoctorScheduleResponse> findAll(String email, Set<String> roles) {
        List<DoctorScheduleResponse> all = findAll();
        if (!ownershipVerifier.isDoctorOnly(roles)) return all;
        Long doctorId = ownershipVerifier.authenticatedDoctorId(email);
        return all.stream().filter(schedule -> doctorId.equals(schedule.doctorId())).toList();
    }

    public DoctorScheduleResponse update(Long id, DoctorScheduleRequest request) {
        doctorsClient.validateDoctor(request.getDoctorId());

        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario de doctor no encontrado con ID: " + id));

        schedule.setDoctorId(request.getDoctorId());
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setActive(request.getActive());

        DoctorSchedule updated = doctorScheduleRepository.save(schedule);
        return mapToResponse(updated);
    }

    public DoctorScheduleResponse update(Long id, DoctorScheduleRequest request, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        ownershipVerifier.requireOwnDoctor(email, request.getDoctorId(), roles);
        return update(id, request);
    }

    public void delete(Long id) {
        if (!doctorScheduleRepository.existsById(id)) {
            throw new RuntimeException("Horario de doctor no encontrado con ID: " + id);
        }
        doctorScheduleRepository.deleteById(id);
    }

    public void delete(Long id, String email, Set<String> roles) {
        ownershipVerifier.requireOwnDoctor(email, findById(id).doctorId(), roles);
        delete(id);
    }

    private DoctorScheduleResponse mapToResponse(DoctorSchedule schedule) {
        return new DoctorScheduleResponse(
                schedule.getDoctorScheduleId(),
                schedule.getDoctorId(),
                schedule.getDayOfWeek().name(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getActive()
        );
    }
}
