package cl.duoc.gateway.filter;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.http.HttpStatusCode;

import cl.duoc.gateway.dto.ApiResponse;
import cl.duoc.gateway.dto.TokenAuthorizationDTO;
import cl.duoc.gateway.security.RoleAuthorizationPolicy;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final WebClient.Builder webClientBuilder;
    private final RoleAuthorizationPolicy roleAuthorizationPolicy;

    public JwtAuthenticationFilter(
            @LoadBalanced WebClient.Builder webClientBuilder,
            RoleAuthorizationPolicy roleAuthorizationPolicy) {
        this.webClientBuilder = webClientBuilder;
        this.roleAuthorizationPolicy = roleAuthorizationPolicy;
    }

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v3/auth/login",
            "/api/v3/auth/register",
            "/api/v3/patient-registrations",
            "/actuator/health",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-ui/index.html",
            "/v3/api-docs/**",
            "/webjards/**");

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authorizationHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            return unauthorized(
                    exchange,
                    "Token JWT no proporcionado");
        }

        String token = authorizationHeader.substring(7);

        Mono<ApiResponse<TokenAuthorizationDTO>> authorizationResponse = webClientBuilder.build()
                .get()
                .uri(
                        "http://auth-service/api/v3/auth/authorization?token={token}",
                        token)
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<ApiResponse<TokenAuthorizationDTO>>() {
                        })
                .onErrorResume(
                        WebClientResponseException.class,
                        ex -> mapAuthResponseError(ex))
                .onErrorResume(
                        ex -> ex instanceof InvalidTokenException
                                || ex instanceof ForbiddenTokenException
                                ? Mono.error(ex)
                                : Mono.error(new AuthServiceUnavailableException(ex)));

        return authorizationResponse
                .flatMap(response -> {

                    if (response == null
                            || response.getData() == null
                            || response.getData().email() == null
                            || response.getData().roles() == null) {

                        return unauthorized(
                                exchange,
                                "Token JWT inválido o expirado");
                    }

                    TokenAuthorizationDTO authorization = response.getData();
                    HttpMethod method = exchange.getRequest().getMethod();
                    if (method == null || !roleAuthorizationPolicy.isAllowed(path, method, authorization.roles())) {
                        return forbidden(exchange, "El rol no tiene permiso para esta operación");
                    }

                    ServerWebExchange authenticatedExchange = exchange.mutate()
                            .request(request -> request.headers(headers -> {
                                headers.remove("X-Authenticated-Email");
                                headers.remove("X-Authenticated-Roles");
                                headers.set("X-Authenticated-Email", authorization.email());
                                headers.set("X-Authenticated-Roles", String.join(",", authorization.roles()));
                            }))
                            .build();

                    return chain.filter(authenticatedExchange);
                })
                .onErrorResume(
                        InvalidTokenException.class,
                        ex -> unauthorized(
                                exchange,
                                "No se pudo validar el token JWT"))
                .onErrorResume(
                        ForbiddenTokenException.class,
                        ex -> forbidden(exchange, "El usuario autenticado está deshabilitado"))
                .onErrorResume(
                        AuthServiceUnavailableException.class,
                        ex -> serviceUnavailable(exchange, "Auth Service no disponible"));
    }

    private Mono<? extends ApiResponse<TokenAuthorizationDTO>> mapAuthResponseError(WebClientResponseException ex) {
        HttpStatusCode status = ex.getStatusCode();
        if (status.value() == HttpStatus.UNAUTHORIZED.value()
                || status.value() == HttpStatus.BAD_REQUEST.value()
                || status.value() == HttpStatus.NOT_FOUND.value()) {
            return Mono.error(new InvalidTokenException(ex));
        }
        if (status.value() == HttpStatus.FORBIDDEN.value()) {
            return Mono.error(new ForbiddenTokenException(ex));
        }
        return Mono.error(new AuthServiceUnavailableException(ex));
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(publicPath -> {
            if (publicPath.endsWith("/**")) {
                return path.startsWith(publicPath.substring(0, publicPath.length() - 3));
            }
            return path.equals(publicPath);
        });
    }

    private Mono<Void> unauthorized(
            ServerWebExchange exchange,
            String message) {

        return writeError(exchange, HttpStatus.UNAUTHORIZED, message);
    }

    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        return writeError(exchange, HttpStatus.FORBIDDEN, message);
    }

    private Mono<Void> serviceUnavailable(ServerWebExchange exchange, String message) {
        return writeError(exchange, HttpStatus.SERVICE_UNAVAILABLE, message);
    }

    private Mono<Void> writeError(
            ServerWebExchange exchange,
            HttpStatus status,
            String message) {

        exchange.getResponse().setStatusCode(status);

        exchange.getResponse()
                .getHeaders()
                .setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {
                  "code": %d,
                  "message": "%s",
                  "data": null
                }\n
                """.formatted(status.value(), message);

        DataBuffer buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));

        return exchange.getResponse()
                .writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private static final class InvalidTokenException extends RuntimeException {
        private InvalidTokenException(Throwable cause) {
            super(cause);
        }
    }

    private static final class AuthServiceUnavailableException extends RuntimeException {
        private AuthServiceUnavailableException(Throwable cause) {
            super(cause);
        }
    }

    private static final class ForbiddenTokenException extends RuntimeException {
        private ForbiddenTokenException(Throwable cause) {
            super(cause);
        }
    }
}
