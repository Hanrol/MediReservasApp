package cl.duoc.users.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.AssignRoleRequestDTO;
import cl.duoc.users.dto.AuthUserResponseDTO;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final WebClient.Builder webClientBuilder;

    public AuthUserResponseDTO getAuthUserByEmail(String email) {
        try {
            ApiResponse<AuthUserResponseDTO> response = webClientBuilder.build()
                    .get()
                    .uri("http://auth-service/api/v3/auth/users/email/{email}", email)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AuthUserResponseDTO>>() {
                    })
                    .block();

            if (response == null || response.getData() == null) {
                throw new RuntimeException("No existe un usuario de autenticación registrado con ese correo");
            }

            return response.getData();

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.NotFound ex) {
            throw new RuntimeException("No existe un usuario de autenticación registrado con ese correo");

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            throw new RuntimeException("Error al consultar Auth Service");

        } catch (Exception ex) {
            throw new RuntimeException("No se pudo conectar con Auth Service");
        }
    }

    public void assignRole(Long authUserId, String roleName) {
        try {
            AssignRoleRequestDTO request = new AssignRoleRequestDTO(roleName);

            webClientBuilder.build()
                    .patch()
                    .uri("http://auth-service/api/v3/auth/users/{authUserId}/roles", authUserId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.NotFound ex) {
            throw new RuntimeException("Usuario de autenticación o rol no encontrado en Auth Service");

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.Conflict ex) {
            throw new RuntimeException("El usuario ya tiene asignado ese rol");

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            throw new RuntimeException("Error al asignar rol en Auth Service");

        } catch (Exception ex) {
            throw new RuntimeException("No se pudo conectar con Auth Service para asignar rol");
        }
    }
}