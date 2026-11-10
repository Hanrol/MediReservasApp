package cl.duoc.appointments.service;

import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.appointments.client.DoctorsClient;
import cl.duoc.appointments.client.UsersClient;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DoctorOwnershipVerifier {
    private final UsersClient usersClient;
    private final DoctorsClient doctorsClient;

    public boolean isDoctorOnly(Set<String> roles) {
        return roles.contains("DOCTOR") && !roles.contains("ADMIN") && !roles.contains("RECEPTIONIST");
    }

    public Long authenticatedDoctorId(String email) {
        Long userId = usersClient.getUserIdByEmail(email);
        return doctorsClient.getDoctorIdForUserId(userId);
    }

    public void requireOwnDoctor(String email, Long requestedDoctorId, Set<String> roles) {
        if (isDoctorOnly(roles) && (email == null || !authenticatedDoctorId(email).equals(requestedDoctorId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a recursos de otro médico");
        }
    }
}
