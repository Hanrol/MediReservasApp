package cl.duoc.notifications.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.notifications.dto.ApiResponse;
import lombok.RequiredArgsConstructor;

// Cambio: cliente WebClient hacia users-service para validar existencia del usuario destinatario.
@Component
@RequiredArgsConstructor
public class UsersClient {

    private final WebClient.Builder webClientBuilder;

    public boolean userExists(Long userId) {
        try {
            ApiResponse<Boolean> response =
                    webClientBuilder.build()
                            .get()
                            .uri("http://users-service/api/v1/users/{userId}/exists", userId)
                            .retrieve()
                            .bodyToMono(
                                    new ParameterizedTypeReference<ApiResponse<Boolean>>() {})
                            .block();

            return response != null && Boolean.TRUE.equals(response.getData());

        } catch (WebClientResponseException.NotFound ex) {
            return false;
        } catch (WebClientResponseException ex) {
            throw new RuntimeException("Error al consultar Users Service");
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo conectar con Users Service");
        }
    }
}
