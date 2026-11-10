package cl.duoc.doctors.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.doctors.dto.AssignRoleRequestDTO;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final WebClient.Builder webClientBuilder;

    public void assignDoctorRole(Long authUserId) {
        try {
            webClientBuilder.build()
                    .patch()
                    .uri(
                            "http://auth-service/api/v3/auth/users/{authUserId}/roles",
                            authUserId
                    )
                    .bodyValue(new AssignRoleRequestDTO("DOCTOR"))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException(
                    "Usuario de autenticación o rol DOCTOR no encontrado"
            );

        } catch (WebClientResponseException.Conflict ex) {
            throw new RuntimeException(
                    "El usuario ya tiene asignado el rol DOCTOR"
            );

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al asignar el rol DOCTOR en Auth Service"
            );
        }
    }
}