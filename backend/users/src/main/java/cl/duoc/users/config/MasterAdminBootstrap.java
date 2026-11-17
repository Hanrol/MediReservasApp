package cl.duoc.users.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.CreateAdministratorProfileRequestDTO;
import cl.duoc.users.dto.CreateUserProfileRequestDTO;
import cl.duoc.users.dto.CreateUserRequestDTO;
import cl.duoc.users.service.AdministratorProfileService;
import cl.duoc.users.service.UserProfileService;
import cl.duoc.users.service.UserService;
import cl.duoc.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MasterAdminBootstrap implements ApplicationRunner {
    private static final Duration AUTH_STARTUP_TIMEOUT = Duration.ofMinutes(3);
    private static final Duration AUTH_RETRY_INTERVAL = Duration.ofSeconds(2);

    private final AuthClient authClient;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserProfileService userProfileService;
    private final AdministratorProfileService administratorProfileService;

    @Value("${app.master-admin.email:}")
    private String email;
    @Value("${app.master-admin.password:}")
    private String password;
    @Value("${app.master-admin.run:}")
    private String run;
    @Value("${app.master-admin.first-name:Administrador}")
    private String firstName;
    @Value("${app.master-admin.last-name:Maestro}")
    private String lastName;
    @Value("${app.master-admin.department:Administración}")
    private String department;
    @Value("${app.master-admin.position:Administrador maestro}")
    private String position;

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank() || run.isBlank()) {
            log.info("Bootstrap ADMIN maestro omitido: faltan app.master-admin.email/password/run");
            return;
        }

        boolean authExists = waitForAuthService();
        if (!authExists) {
            authClient.registerUser(email, password);
            log.info("Cuenta de autenticación del ADMIN maestro creada");
        }

        var authUser = authClient.getAuthUserByEmail(email);
        if (!authUser.enabled()) {
            authClient.enableUser(authUser.authUserId());
        }

        var user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Usuario base del ADMIN maestro creado");
            return userRepository.save(userServiceEntity(email, run, authUser.authUserId()));
        });
        if (!user.getAuthUserId().equals(authUser.authUserId())) {
            throw new IllegalStateException("El correo configurado para ADMIN maestro ya está asociado a otra cuenta Auth");
        }
        userService.ensureMasterAdminActive(user.getUserId());

        if (!userProfileService.existsByUserId(user.getUserId())) {
            userProfileService.createUserProfile(new CreateUserProfileRequestDTO(
                    user.getUserId(), firstName, lastName, null, null, null));
        }

        if (!administratorProfileService.existsByUserId(user.getUserId())) {
            administratorProfileService.createAdministratorProfile(
                    new CreateAdministratorProfileRequestDTO(user.getUserId(), department, position));
        } else {
            authClient.assignRole(authUser.authUserId(), "ADMIN");
        }
        log.info("Bootstrap ADMIN maestro verificado y activo");
    }

    private boolean waitForAuthService() {
        long deadline = System.nanoTime() + AUTH_STARTUP_TIMEOUT.toNanos();
        int attempts = 0;

        while (true) {
            try {
                return authClient.authUserExistsByEmail(email);
            } catch (ResponseStatusException exception) {
                if (exception.getStatusCode().value() != HttpStatus.SERVICE_UNAVAILABLE.value()
                        || System.nanoTime() >= deadline) {
                    throw exception;
                }

                attempts++;
                if (attempts == 1 || attempts % 15 == 0) {
                    log.warn("Auth Service todavía no está disponible; se reintentará (intento {}).", attempts);
                }

                try {
                    Thread.sleep(AUTH_RETRY_INTERVAL.toMillis());
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(
                            "Se interrumpió la espera inicial del Auth Service", interruptedException);
                }
            }
        }
    }

    private cl.duoc.users.model.User userServiceEntity(String userEmail, String userRun, Long authUserId) {
        var user = new cl.duoc.users.model.User();
        user.setAuthUserId(authUserId);
        user.setEmail(userEmail);
        user.setRun(userRun);
        user.setActive(true);
        return user;
    }
}
