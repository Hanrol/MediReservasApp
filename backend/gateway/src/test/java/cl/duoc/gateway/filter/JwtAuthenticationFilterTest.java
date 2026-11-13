package cl.duoc.gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;

import cl.duoc.gateway.security.RoleAuthorizationPolicy;
import reactor.core.publisher.Mono;

class JwtAuthenticationFilterTest {

    private static final String AUTHORIZATION_RESPONSE = """
            {"code":200,"message":"ok","data":{"email":"doctor@example.test","roles":["DOCTOR"]}}
            """;

    @Test
    void invalidTokenResponseMapsToUnauthorized() {
        var exchange = authenticatedExchange();

        filterReturning(HttpStatus.BAD_REQUEST).filter(exchange, ignored -> Mono.empty()).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void disabledUserResponseMapsToForbidden() {
        var exchange = authenticatedExchange();

        filterReturning(HttpStatus.FORBIDDEN).filter(exchange, ignored -> Mono.empty()).block();

        assertEquals(HttpStatus.FORBIDDEN, exchange.getResponse().getStatusCode());
    }

    @Test
    void authServerErrorMapsToServiceUnavailable() {
        var exchange = authenticatedExchange();

        filterReturning(HttpStatus.INTERNAL_SERVER_ERROR).filter(exchange, ignored -> Mono.empty()).block();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exchange.getResponse().getStatusCode());
    }

    @Test
    void downstreamFailureIsPropagatedAfterSuccessfulAuthentication() {
        var exchange = authenticatedExchange();
        IllegalStateException downstreamFailure = new IllegalStateException("downstream failed");
        GatewayFilterChain chain = ignored -> Mono.error(downstreamFailure);

        IllegalStateException actual = assertThrows(IllegalStateException.class,
                () -> filterReturning(HttpStatus.OK).filter(exchange, chain).block());

        assertEquals(downstreamFailure, actual);
    }

    @Test
    void patientRegistrationIsPublicAndContinuesWithoutJwtValidation() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v3/patient-registrations").build());
        var filter = filterReturning(HttpStatus.INTERNAL_SERVER_ERROR);
        boolean[] continued = { false };

        filter.filter(exchange, ignored -> {
            continued[0] = true;
            return Mono.empty();
        }).block();

        assertEquals(true, continued[0]);
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void invitationAcceptanceIsPublicAndContinuesWithoutJwtValidation() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v3/invitations/accept").build());
        var filter = filterReturning(HttpStatus.INTERNAL_SERVER_ERROR);
        boolean[] continued = { false };

        filter.filter(exchange, ignored -> {
            continued[0] = true;
            return Mono.empty();
        }).block();

        assertEquals(true, continued[0]);
        assertNull(exchange.getResponse().getStatusCode());
    }

    private JwtAuthenticationFilter filterReturning(HttpStatus authStatus) {
        String responseBody = authStatus == HttpStatus.OK ? AUTHORIZATION_RESPONSE : "auth error";
        ExchangeFunction exchangeFunction = request -> Mono.just(ClientResponse.create(authStatus)
                .header("Content-Type", "application/json")
                .body(responseBody)
                .build());
        WebClient.Builder webClientBuilder = WebClient.builder().exchangeFunction(exchangeFunction);
        return new JwtAuthenticationFilter(webClientBuilder, new RoleAuthorizationPolicy());
    }

    private MockServerWebExchange authenticatedExchange() {
        return MockServerWebExchange.from(MockServerHttpRequest.get("/api/v3/doctors")
                .header("Authorization", "Bearer test-token")
                .build());
    }
}
