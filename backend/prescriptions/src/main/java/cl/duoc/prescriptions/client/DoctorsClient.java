package cl.duoc.prescriptions.client;

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
            log.info("Doctor ID: {} verificado correctamente.", doctorId);
        } catch (WebClientResponseException.NotFound ex) {
            log.warn("Doctor ID: {} no existe.", doctorId);
            throw new RuntimeException("El doctor con ID " + doctorId + " no existe.");
        } catch (Exception ex) {
            log.error("Error de comunicación con doctors-service", ex);
            throw new RuntimeException("No se pudo validar el doctor en este momento.");
        }
    }
}