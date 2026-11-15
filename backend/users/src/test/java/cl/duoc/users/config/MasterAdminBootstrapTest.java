package cl.duoc.users.config;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import cl.duoc.users.client.AuthClient;
import cl.duoc.users.dto.AuthUserResponseDTO;
import cl.duoc.users.model.User;
import cl.duoc.users.repository.UserRepository;
import cl.duoc.users.service.AdministratorProfileService;
import cl.duoc.users.service.UserProfileService;
import cl.duoc.users.service.UserService;

@ExtendWith(MockitoExtension.class)
class MasterAdminBootstrapTest {

    @Mock private AuthClient authClient;
    @Mock private UserRepository userRepository;
    @Mock private UserService userService;
    @Mock private UserProfileService userProfileService;
    @Mock private AdministratorProfileService administratorProfileService;

    @InjectMocks private MasterAdminBootstrap bootstrap;

    @Test
    void startupRepairsExistingMasterWithoutRegisteringOrDuplicatingProfiles() {
        ReflectionTestUtils.setField(bootstrap, "email", "master@test.cl");
        ReflectionTestUtils.setField(bootstrap, "password", "ignored-for-existing-account");
        ReflectionTestUtils.setField(bootstrap, "run", "11.111.111-1");
        AuthUserResponseDTO auth = new AuthUserResponseDTO(8L, "master@test.cl", true, null, List.of("ADMIN"));
        User user = new User();
        user.setUserId(3L);
        user.setAuthUserId(8L);
        user.setEmail("master@test.cl");

        when(authClient.authUserExistsByEmail("master@test.cl")).thenReturn(true);
        when(authClient.getAuthUserByEmail("master@test.cl")).thenReturn(auth);
        when(userRepository.findByEmail("master@test.cl")).thenReturn(Optional.of(user));
        when(userProfileService.existsByUserId(3L)).thenReturn(true);
        when(administratorProfileService.existsByUserId(3L)).thenReturn(true);

        bootstrap.run(null);

        verify(authClient, never()).registerUser(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString());
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
        verify(userService).ensureMasterAdminActive(3L);
        verify(authClient).assignRole(8L, "ADMIN");
    }
}
