package cl.duoc.appointments.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.appointments.dto.ApiResponse;
import cl.duoc.appointments.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;

// Cambio: cliente WebClient hacia users-service para validar existencia de IDs externos.
@Component
@RequiredArgsConstructor
public class UsersClient {

    private final WebClient.Builder webClientBuilder;

    public boolean userExists(Long userId) {
        try {
            ApiResponse<Boolean> response =
                    webClientBuilder.build()
                            .get()
                            .uri("http://users-service/api/v3/users/{userId}/exists", userId)
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

    public Long getUserIdByEmail(String email) {
        try {
            ApiResponse<UserResponseDTO> response = webClientBuilder.build()
                    .get()
                    .uri("http://users-service/api/v3/users/email/{email}", email)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<UserResponseDTO>>() {})
                    .block();
            if (response == null || response.getData() == null || !response.getData().active()) {
                throw new RuntimeException("Usuario autenticado sin perfil activo en Users Service");
            }
            return response.getData().userId();
        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException("Usuario autenticado no tiene perfil en Users Service");
        } catch (WebClientResponseException ex) {
            throw new RuntimeException("Error al consultar el usuario autenticado");
        }
    }
}
