package cl.duoc.reports;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import cl.duoc.reports.client.UsersClient;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.flyway.enabled=false"
})
class ReportsApplicationTests {

	@MockitoBean
	UsersClient usersClient;
	
	@Test
	void contextLoads() {
	}

}
