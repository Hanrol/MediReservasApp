package cl.duoc.medical_records.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import cl.duoc.medical_records.dto.ApiResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppointmentsClient 
{
    private final WebClient.Builder webClientBuilder;

    public AppointmentData getAppointment(Long appointmentId) {
        try {
            ApiResponse<AppointmentData> response = webClientBuilder.build().get()
                    .uri("http://appointments-service/api/v3/appointments/internal/{appointmentId}", appointmentId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<AppointmentData>>() {})
                    .block();
            if (response == null || response.getData() == null) {
                throw new RuntimeException("No se pudo verificar la cita");
            }
            return response.getData();
        } catch (WebClientResponseException ex) {
            throw new RuntimeException("No se pudo verificar la cita asociada");
        }
    }

    public record AppointmentData(Long appointmentId, Long patientUserId, Long doctorId) {}
}
