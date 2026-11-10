package cl.duoc.medical_records.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class ClinicalOwnershipVerifierTest {
    @Test
    void doctorCanAccessOwnVisit() {
        assertDoesNotThrow(() -> ClinicalOwnershipVerifier.assertDoctorAccess(17L, 17L));
    }

    @Test
    void doctorCannotAccessAnotherDoctorsVisit() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> ClinicalOwnershipVerifier.assertDoctorAccess(17L, 23L));
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void missingAuthenticatedDoctorIsDenied() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> ClinicalOwnershipVerifier.assertDoctorAccess(null, 23L));
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void resourceWithoutDoctorOwnerIsDenied() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> ClinicalOwnershipVerifier.assertDoctorAccess(17L, null));
        assertEquals(403, exception.getStatusCode().value());
    }
}
