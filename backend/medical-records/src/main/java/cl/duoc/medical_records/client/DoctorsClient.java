package cl.duoc.medical_records.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DoctorsClient {
    private final WebClient.Builder webClientBuilder;

    public Boolean doctorIdVerification(Long doctorId) {
        try {
            DoctorData response = webClientBuilder.build()
                    .get()
                    .uri("http://doctors-service/api/v3/doctors/{id}", doctorId)
                    .retrieve()
                    .bodyToMono(DoctorData.class)
                    .block();
            return response != null && doctorId.equals(response.doctorId()) && response.active();

        } catch (WebClientResponseException.NotFound ex) {
            return false;

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al verificar la existencia de ID del Doctor"
            );
        }
    }

    private record DoctorData(Long doctorId, Long userId, String medicalLicenseNumber,
            boolean active, java.util.List<Long> specialtyIds) {}
}
