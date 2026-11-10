package cl.duoc.appointments.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.core.ParameterizedTypeReference;
import java.util.List;

import cl.duoc.appointments.dto.DoctorResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DoctorsClient {

    private final WebClient.Builder webClientBuilder;

    public void validateDoctor(Long doctorId) {
        log.info("Validando existencia del doctor ID: {} en doctors-service...", doctorId);
        try {
            webClientBuilder.build()
                    .get()
                    .uri("http://doctors-service/api/v3/doctors/{id}", doctorId)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
                    
            log.info("Doctor ID: {} existe y es válido.", doctorId);

        } catch (WebClientResponseException.NotFound ex) {
            log.warn("El doctor ID: {} no fue encontrado (404).", doctorId);
            throw new RuntimeException("El doctor con ID " + doctorId + " no existe.");
            
        } catch (Exception ex) {
            log.error("Error de comunicación con doctors-service al validar doctor ID: {}", doctorId, ex);
            throw new RuntimeException("No se pudo validar el doctor. Intente más tarde.");
        }
    }

    public Long getUserIdForDoctor(Long doctorId) {
        try {
            DoctorResponseDTO doctor = webClientBuilder.build().get()
                    .uri("http://doctors-service/api/v3/doctors/{id}", doctorId)
                    .retrieve()
                    .bodyToMono(DoctorResponseDTO.class)
                    .block();
            if (doctor == null || !doctor.active()) {
                throw new RuntimeException("El médico no existe o está inactivo");
            }
            return doctor.userId();
        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException("Médico no encontrado");
        } catch (WebClientResponseException ex) {
            throw new RuntimeException("Error al consultar Doctors Service");
        }
    }

    public Long getDoctorIdForUserId(Long userId) {
        List<DoctorResponseDTO> doctors = webClientBuilder.build().get()
                .uri("http://doctors-service/api/v3/doctors")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<DoctorResponseDTO>>() {})
                .block();
        if (doctors == null) {
            throw new RuntimeException("No se pudo consultar Doctors Service");
        }
        return doctors.stream()
                .filter(DoctorResponseDTO::active)
                .filter(doctor -> userId.equals(doctor.userId()))
                .map(DoctorResponseDTO::doctorId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No existe un perfil médico activo para el usuario"));
    }
}
