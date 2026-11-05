package cl.duoc.payments.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.payments.dto.ApiResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppointmentsClient {

    private final WebClient.Builder webClientBuilder;

    public Boolean appointmentIdVerification(Long appointmentId) {
        try {
            ApiResponse<Boolean> response = webClientBuilder.build()
                    .get()
                    .uri(
                            "http://appointments-service/api/v1/appointments/{appointmentId}/exists",
                            appointmentId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Boolean>>() {
                    })
                    .block();

            return response != null && Boolean.TRUE.equals(response.getData());

        } catch (WebClientResponseException.NotFound ex) {
            throw new RuntimeException(
                    "Cita no encontrada con ID: " + appointmentId);

        } catch (WebClientResponseException ex) {
            throw new RuntimeException(
                    "Error al verificar la existencia de la cita en Appointments Service");

        } catch (Exception ex) {
            throw new RuntimeException(
                    "No se pudo conectar con Appointments Service");
        }
    }
}