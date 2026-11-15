package cl.duoc.gateway.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

class RoleAuthorizationPolicyTest {

    private final RoleAuthorizationPolicy policy = new RoleAuthorizationPolicy();

    @Test
    void administratorCannotChangeExistingUserRolesThroughGateway() {
        assertFalse(policy.isAllowed("/api/v3/auth/users/1/roles", HttpMethod.PATCH, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/auth/users/1/roles", HttpMethod.PATCH, List.of("PATIENT")));
        assertFalse(policy.isAllowed("/api/v3/patient-profiles", HttpMethod.POST, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/receptionist-profiles", HttpMethod.POST, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/administrator-profiles", HttpMethod.POST, List.of("ADMIN")));
        assertTrue(policy.isAllowed("/api/v3/doctors", HttpMethod.POST, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/doctors", HttpMethod.POST, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/doctors", HttpMethod.POST, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/doctors/me", HttpMethod.POST, List.of("DOCTOR")));
        assertTrue(policy.isAllowed("/api/v3/admin/invitations", HttpMethod.POST, List.of("ADMIN")));
    }

    @Test
    void patientCanReadCatalogAndOwnCollectionRoutesButNotManageDoctors() {
        assertTrue(policy.isAllowed("/api/v3/specialties", HttpMethod.GET, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/users/me", HttpMethod.GET, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/appointments/patient/12", HttpMethod.GET, List.of("PATIENT")));
        assertFalse(policy.isAllowed("/api/v3/doctors", HttpMethod.POST, List.of("PATIENT")));
        assertFalse(policy.isAllowed("/api/v3/users/email/other@example.test", HttpMethod.GET, List.of("PATIENT")));
        assertFalse(policy.isAllowed("/api/v3/users/me", HttpMethod.GET, List.of()));
        assertTrue(policy.isAllowed("/api/v3/admin/invitations", HttpMethod.POST, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/admin/invitations", HttpMethod.POST, List.of("RECEPTIONIST")));
    }

    @Test
    void doctorCanManageScheduleButCannotManageUsersOrInternalAppointments() {
        assertTrue(policy.isAllowed("/api/v3/doctor-schedules", HttpMethod.POST, List.of("DOCTOR")));
        assertTrue(policy.isAllowed("/api/v3/users/me", HttpMethod.GET, List.of("DOCTOR")));
        assertTrue(policy.isAllowed("/api/v3/doctors/me", HttpMethod.POST, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/doctors/me", HttpMethod.POST, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/users/me/profile", HttpMethod.PUT, List.of("DOCTOR")));
        assertTrue(policy.isAllowed("/api/v3/users/me/profile", HttpMethod.PUT, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/users/me/profile-completion", HttpMethod.GET, List.of("PATIENT")));
        assertTrue(policy.isAllowed("/api/v3/patient-profiles/me", HttpMethod.PUT, List.of("PATIENT")));
        assertFalse(policy.isAllowed("/api/v3/patient-profiles/me", HttpMethod.PUT, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/users", HttpMethod.GET, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/appointments/internal/10", HttpMethod.GET, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/appointments/internal/10", HttpMethod.GET, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/appointments/internal/10", HttpMethod.GET, List.of("RECEPTIONIST")));
        assertFalse(policy.isAllowed("/api/v3/patient-profiles/internal/user/10/exists", HttpMethod.GET, List.of("ADMIN")));
        assertFalse(policy.isAllowed("/api/v3/patient-profiles/internal/user/10/exists", HttpMethod.GET, List.of("PATIENT")));
    }

    @Test
    void doctorCanUseOwnedClinicalRoutesButCannotAdministerRecords() {
        for (String path : List.of("/api/v3/medical-records/10", "/api/v3/medical-visit/10",
                "/api/v3/diagnoses/10", "/api/v3/vital-signs/10")) {
            assertTrue(policy.isAllowed(path, HttpMethod.GET, List.of("DOCTOR")), path + " GET");
        }

        for (String path : List.of("/api/v3/medical-visit/10", "/api/v3/diagnoses/10", "/api/v3/vital-signs/10")) {
            assertTrue(policy.isAllowed(path, HttpMethod.POST, List.of("DOCTOR")), path + " POST");
            assertTrue(policy.isAllowed(path, HttpMethod.PUT, List.of("DOCTOR")), path + " PUT");
            assertTrue(policy.isAllowed(path, HttpMethod.DELETE, List.of("DOCTOR")), path + " DELETE");
        }

        assertFalse(policy.isAllowed("/api/v3/medical-records", HttpMethod.POST, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/medical-records/10/deactivate", HttpMethod.PUT, List.of("DOCTOR")));
        assertFalse(policy.isAllowed("/api/v3/medical-records/10", HttpMethod.DELETE, List.of("DOCTOR")));
        assertTrue(policy.isAllowed("/api/v3/medical-visit/10", HttpMethod.POST, List.of("RECEPTIONIST")));
    }

    @Test
    void unknownOrMissingRoleIsDenied() {
        assertFalse(policy.isAllowed("/api/v3/appointments", HttpMethod.GET, List.of()));
        assertFalse(policy.isAllowed("/api/v3/unmapped", HttpMethod.GET, List.of("RECEPTIONIST")));
    }
}
