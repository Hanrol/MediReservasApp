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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;

import cl.duoc.gateway.dto.ApiResponse;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final WebClient.Builder webClientBuilder;

    public JwtAuthenticationFilter(
            @LoadBalanced WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
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

        String authorization = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {

            return unauthorized(
                    exchange,
                    "Token JWT no proporcionado");
        }

        String token = authorization.substring(7);

        return webClientBuilder.build()
                .get()
                .uri(
                        "http://auth-service/api/v1/auth/validate?token={token}",
                        token)
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<ApiResponse<Boolean>>() {
                        })
                .flatMap(response -> {

                    if (response == null
                            || !Boolean.TRUE.equals(response.getData())) {

                        return unauthorized(
                                exchange,
                                "Token JWT inválido o expirado");
                    }

                    return chain.filter(exchange);
                })
                .onErrorResume(
                        WebClientResponseException.class,
                        ex -> unauthorized(
                                exchange,
                                "No se pudo validar el token JWT"))
                .onErrorResume(
                        ex -> unauthorized(
                                exchange,
                                "Auth Service no disponible"));
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream()
                .anyMatch(path::equals);
    }

    private Mono<Void> unauthorized(
            ServerWebExchange exchange,
            String message) {

        exchange.getResponse()
                .setStatusCode(HttpStatus.UNAUTHORIZED);

        exchange.getResponse()
                .getHeaders()
                .setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {
                  "code": 401,
                  "message": "%s",
                  "data": null
                }
                """.formatted(message);

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
}
