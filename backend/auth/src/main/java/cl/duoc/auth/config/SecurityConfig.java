package cl.duoc.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import cl.duoc.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // Públicos
                        .requestMatchers(HttpMethod.POST, "/api/v3/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v3/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v3/auth/validate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v3/auth/authorization").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v3/auth/token/email").permitAll()

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-ui/index.html",
                                "/v3/api-docs/**",
                                "/webjards/**")
                        .permitAll()

                        // Internos para integración entre microservicios
                        .requestMatchers(HttpMethod.GET, "/api/v3/auth/users/email/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v3/auth/users/*/exists").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v3/auth/users/*/roles").permitAll()

                        // El resto requiere JWT
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
