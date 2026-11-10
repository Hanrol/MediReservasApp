package cl.duoc.medical_records.client;

import cl.duoc.medical_records.dto.ApiResponse;
import cl.duoc.medical_records.dto.IdVerificationRequestDTO;

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

    public Boolean patientIdVerification(Long patientId) {
        try {
            ApiResponse<Boolean> response = webClientBuilder.build()
                    .patch()
                    .uri(
                            "http://users-service/api/v3/patient-profile/{patientProfileId}",
                            patientId
                    )
                    .bodyValue(new IdVerificationRequestDTO(patientId))
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
                    "Error al verificar la existencia de ID del Paciente"
            );
        }
    }
}
