package cl.duoc.doctors.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.doctors.dto.ApiResponse;
import cl.duoc.doctors.dto.AuthUserRoleResponseDTO;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final WebClient.Builder webClientBuilder;

    public AuthUserRoleResponseDTO getAuthUserByEmail(String email) {
        try {
            ApiResponse<AuthUserRoleResponseDTO> response = webClientBuilder.build()
                    .get()
                    .uri("http://auth-service/api/v3/auth/users/email/{email}", email)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AuthUserRoleResponseDTO>>() {})
                    .block();
            if (response == null || response.getData() == null) {
                throw new RuntimeException("Auth Service no devolvió el usuario");
            }
            return response.getData();
        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException("Usuario de autenticación no encontrado", ex);
        } catch (WebClientResponseException ex) {
            throw new RuntimeException("Error al consultar Auth Service", ex);
        }
    }
}
