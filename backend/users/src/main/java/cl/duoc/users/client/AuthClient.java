package cl.duoc.users.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.dto.ApiResponse;
import cl.duoc.users.dto.AuthRegistrationResponseDTO;
import cl.duoc.users.dto.AssignRoleRequestDTO;
import cl.duoc.users.dto.AuthUserResponseDTO;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final WebClient.Builder webClientBuilder;

    public AuthRegistrationResponseDTO registerUser(String email, String password) {
        try {
            ApiResponse<AuthRegistrationResponseDTO> response = webClientBuilder.build()
                    .post()
                    .uri("http://auth-service/api/v3/auth/register")
                    .bodyValue(new AuthRegistrationRequest(email, password))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AuthRegistrationResponseDTO>>() {
                    })
                    .block();

            if (response == null || response.getData() == null) {
                throw new RuntimeException("Auth Service no devolvió la cuenta registrada");
            }

            return response.getData();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.Conflict ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una cuenta asociada a este correo", ex);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo completar el registro en Auth Service", ex);
        } catch (Exception ex) {
            if (ex instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo conectar con Auth Service", ex);
        }
    }

    public AuthRegistrationResponseDTO authenticateExistingUser(String email, String password) {
        try {
            ApiResponse<AuthRegistrationResponseDTO> response = webClientBuilder.build()
                    .post()
                    .uri("http://auth-service/api/v3/auth/login")
                    .bodyValue(new AuthRegistrationRequest(email, password))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AuthRegistrationResponseDTO>>() {
                    })
                    .block();

            if (response == null || response.getData() == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Auth Service no devolvió la cuenta autenticada");
            }

            return response.getData();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.BadRequest
                | org.springframework.web.reactive.function.client.WebClientResponseException.Unauthorized ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una cuenta para este correo. Para continuar, usa la contraseña elegida en el intento anterior o solicita ayuda a administración.", ex);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo validar la cuenta existente en Auth Service", ex);
        } catch (Exception ex) {
            if (ex instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo conectar con Auth Service", ex);
        }
    }

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

    public void enableUser(Long authUserId) {
        try {
            webClientBuilder.build().patch()
                    .uri("http://auth-service/api/v3/auth/users/{authUserId}/enable", authUserId)
                    .retrieve().bodyToMono(Void.class).block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.Conflict ex) {
            // Enabling an already enabled account is harmless for the bootstrap.
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo habilitar la cuenta maestra en Auth Service", ex);
        }
    }

    public boolean authUserExistsByEmail(String email) {
        try {
            ApiResponse<AuthUserResponseDTO> response = webClientBuilder.build()
                    .get()
                    .uri("http://auth-service/api/v3/auth/users/email/{email}", email)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AuthUserResponseDTO>>() {
                    })
                    .block();
            return response != null && response.getData() != null;
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.NotFound ex) {
            return false;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo validar el correo en Auth Service", ex);
        }
    }

    private record AuthRegistrationRequest(String email, String password) {
    }
}
