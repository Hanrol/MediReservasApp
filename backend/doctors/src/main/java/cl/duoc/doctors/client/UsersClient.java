package cl.duoc.doctors.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.doctors.dto.ApiResponse;
import cl.duoc.doctors.dto.UserInternalResponseDTO;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsersClient {

    private final WebClient.Builder webClientBuilder;

    public UserInternalResponseDTO getUserById(Long userId) {
        try {
            ApiResponse<UserInternalResponseDTO> response =
                    webClientBuilder.build()
                            .get()
                            .uri(
                                    "http://users-service/api/v3/users/{userId}",
                                    userId
                            )
                            .retrieve()
                            .bodyToMono(
                                    new ParameterizedTypeReference<
                                            ApiResponse<UserInternalResponseDTO>
                                    >() {}
                            )
                            .block();

            if (response == null || response.getData() == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            return response.getData();

        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException("Usuario no encontrado");

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al consultar Users Service"
            );

        } catch (Exception ex) {
            throw new RuntimeException(
                    "No se pudo conectar con Users Service"
            );
        }
    }

    public boolean hasGeneralProfile(Long userId) {
        return getBoolean(
                "http://users-service/api/v3/user-profiles/user/{userId}/exists",
                userId
        );
    }

    public boolean hasPatientProfile(Long userId) {
        return getBoolean(
                "http://users-service/api/v3/patient-profiles/user/{userId}/exists",
                userId
        );
    }

    public boolean hasReceptionistProfile(Long userId) {
        return getBoolean(
                "http://users-service/api/v3/receptionist-profiles/user/{userId}/exists",
                userId
        );
    }

    public boolean hasAdministratorProfile(Long userId) {
        return getBoolean(
                "http://users-service/api/v3/administrator-profiles/user/{userId}/exists",
                userId
        );
    }

    private boolean getBoolean(String uri, Long userId) {
        try {
            ApiResponse<Boolean> response =
                    webClientBuilder.build()
                            .get()
                            .uri(uri, userId)
                            .retrieve()
                            .bodyToMono(
                                    new ParameterizedTypeReference<
                                            ApiResponse<Boolean>
                                    >() {}
                            )
                            .block();

            return response != null
                    && Boolean.TRUE.equals(response.getData());

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al validar perfil en Users Service"
            );
        }
    }
}