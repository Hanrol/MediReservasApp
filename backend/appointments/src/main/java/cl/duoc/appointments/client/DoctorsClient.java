package cl.duoc.appointments.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
                    .uri("http://doctors-service/api/v2/doctors/{id}", doctorId)
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
}