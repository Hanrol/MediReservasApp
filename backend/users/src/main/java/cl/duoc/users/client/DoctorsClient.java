package cl.duoc.users.client;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DoctorsClient {

    private final WebClient.Builder webClientBuilder;

    public boolean hasDoctorProfile(Long userId) {
        try {
            Boolean response = webClientBuilder.build()
                    .get()
                    .uri("http://doctors-service/api/v3/doctors/user/{userId}/exists", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(response);
        } catch (WebClientResponseException.NotFound ex) {
            return false;
        } catch (WebClientResponseException ex) {
            throw new IllegalStateException("No se pudo consultar el perfil profesional", ex);
        }
    }
}
