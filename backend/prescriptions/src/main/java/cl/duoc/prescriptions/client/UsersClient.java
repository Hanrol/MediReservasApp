package cl.duoc.prescriptions.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsersClient {

    private final WebClient.Builder webClientBuilder;

    public void validatePatient(Long patientUserId) {
        log.info("Validando existencia del paciente ID: {} en users-service...", patientUserId);
        try {
            webClientBuilder.build()
                    .get()
                    .uri("http://users-service/api/v1/users/{id}", patientUserId)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("Paciente ID: {} verificado correctamente.", patientUserId);
        } catch (WebClientResponseException.NotFound ex) {
            log.warn("Paciente ID: {} no existe.", patientUserId);
            throw new RuntimeException("El paciente con ID " + patientUserId + " no existe.");
        } catch (Exception ex) {
            log.error("Error de comunicación con users-service", ex);
            throw new RuntimeException("No se pudo validar el paciente en este momento.");
        }
    }
}