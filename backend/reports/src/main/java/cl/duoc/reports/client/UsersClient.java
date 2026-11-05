package cl.duoc.reports.client;

import cl.duoc.reports.dto.ApiResponse;
import cl.duoc.reports.dto.IdVerificationRequestDTO;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsersClient 
{
    private final WebClient.Builder webClientBuilder;

    public Boolean byUserIdVerification(Long requestedByUserId) {
        try {
            ApiResponse<Boolean> response = webClientBuilder.build()
                    .patch()
                    .uri(
                            "http://users-service/api/v1/users/{userId}/exists",
                            requestedByUserId
                    )
                    .bodyValue(new IdVerificationRequestDTO(requestedByUserId))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Boolean>>() {})
                    .block();
            return response != null && Boolean.TRUE.equals(response.getData());

        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException(
                    "ID de Paciente no encontrado"
            );


        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al verificar la existencia de ID del Usuario"
            );
        }
    }
}
