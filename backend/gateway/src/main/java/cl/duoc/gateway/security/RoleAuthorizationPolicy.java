package cl.duoc.gateway.security;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

@Component
public class RoleAuthorizationPolicy {

    private static final String ADMIN = "ADMIN";
    private static final String RECEPTIONIST = "RECEPTIONIST";
    private static final String DOCTOR = "DOCTOR";
    private static final String PATIENT = "PATIENT";

    private final AntPathMatcher paths = new AntPathMatcher();

    public boolean isAllowed(String path, HttpMethod method, List<String> roles) {
        if (paths.match("/api/v3/appointments/internal/**", path)) {
            return false;
        }

        List<String> normalizedRoles = roles.stream()
                .map(role -> role.toUpperCase(Locale.ROOT))
                .toList();

        if (normalizedRoles.contains(ADMIN)) {
            return true;
        }

        if (isRead(method) && matches(path, "/api/v3/doctors/**", "/api/v3/specialties/**")) {
            return hasAny(normalizedRoles, PATIENT, DOCTOR, RECEPTIONIST);
        }

        if (matches(path, "/api/v3/doctor-schedules/**", "/api/v3/doctor-time-off/**", "/api/v3/schedule-slots/**")) {
            return hasAny(normalizedRoles, DOCTOR, RECEPTIONIST);
        }

        if (matches(path, "/api/v3/appointments/**")) {
            if (normalizedRoles.contains(RECEPTIONIST)) {
                return true;
            }
            if (normalizedRoles.contains(DOCTOR)) {
                return (isRead(method) && paths.match("/api/v3/appointments/doctor/**", path))
                        || path.endsWith("/confirm")
                        || path.endsWith("/complete") || path.endsWith("/no-show");
            }
            if (normalizedRoles.contains(PATIENT)) {
                return (isRead(method) && paths.match("/api/v3/appointments/patient/**", path))
                        || (method == HttpMethod.POST && "/api/v3/appointments".equals(path))
                        || (method == HttpMethod.PATCH && path.endsWith("/cancel"));
            }
        }

        if (matches(path,
                "/api/v3/users/**",
                "/api/v3/user-profiles/**",
                "/api/v3/patient-profiles/**",
                "/api/v3/receptionist-profiles/**",
                "/api/v3/administrator-profiles/**")) {
            if (normalizedRoles.contains(RECEPTIONIST)) {
                return true;
            }
            return normalizedRoles.contains(PATIENT)
                    && isRead(method)
                    && paths.match("/api/v3/patient-profiles/user/**", path);
        }

        if (matches(path,
                "/api/v3/medical-records/**",
                "/api/v3/medical-visit/**",
                "/api/v3/diagnoses/**",
                "/api/v3/vital-signs/**")) {
            if (normalizedRoles.contains(RECEPTIONIST)) {
                return true;
            }
            if (normalizedRoles.contains(DOCTOR)) {
                // Clinical controllers enforce ownership for reads and visit/diagnosis/vital-sign writes.
                // Record administration remains restricted to ADMIN and RECEPTIONIST.
                return isRead(method)
                        || matches(path,
                                "/api/v3/medical-visit/**",
                                "/api/v3/diagnoses/**",
                                "/api/v3/vital-signs/**");
            }
            return false;
        }

        // Sensitive or unmapped routes are denied unless the user is an administrator.
        return false;
    }

    private boolean isRead(HttpMethod method) {
        return method == HttpMethod.GET || method == HttpMethod.HEAD;
    }

    private boolean matches(String path, String... patterns) {
        for (String pattern : patterns) {
            if (paths.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasAny(List<String> roles, String... allowedRoles) {
        for (String role : allowedRoles) {
            if (roles.contains(role)) {
                return true;
            }
        }
        return false;
    }
}
