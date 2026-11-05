package cl.duoc.payments.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.payments.dto.ApiResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsersClient {

    private final WebClient.Builder webClientBuilder;

    public Boolean patientIdVerification(Long patientUserId) {
        try {
            ApiResponse<Boolean> response = webClientBuilder.build()
                    .get()
                    .uri(
                            "http://users-service/api/v1/patient-profiles/user/{userId}/exists",
                            patientUserId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Boolean>>() {
                    })
                    .block();

            return response != null && Boolean.TRUE.equals(response.getData());

        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException(
                    "Paciente no encontrado con ID de usuario: " + patientUserId);

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al verificar la existencia del paciente en Users Service");

        } catch (Exception ex) {
            throw new RuntimeException(
                    "No se pudo conectar con Users Service");
        }
    }
}