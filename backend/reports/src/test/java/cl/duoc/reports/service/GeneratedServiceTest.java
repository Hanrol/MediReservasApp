package cl.duoc.reports.service;

import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import cl.duoc.reports.client.UsersClient;
import cl.duoc.reports.dto.GeneratedReportResponseDTO;
import cl.duoc.reports.extras.ToDTO;
import cl.duoc.reports.model.GeneratedReport; 
import cl.duoc.reports.repository.GeneratedReportRepository;

public class GeneratedServiceTest {
    @Test
    void testFindById()
    { 
        GeneratedReportRepository generatedReportRepository = Mockito.mock(GeneratedReportRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        ToDTO toDTO = Mockito.mock(ToDTO.class);
        GeneratedReportService generatedReportService = new GeneratedReportService(toDTO, generatedReportRepository, usersClient);

        GeneratedReport generatedReport = new GeneratedReport();
        GeneratedReportResponseDTO dto = new GeneratedReportResponseDTO(1L, 1L, 1L, "TIPO DEL SISTEMA", LocalDateTime.now(), "FORMATO DEL SISTEMA", "PATH DEL SISTEMA", "ESTADO DEL SISTEMA");

        Mockito.when(generatedReportRepository.findAll()).thenReturn(List.of(generatedReport));
        Mockito.when(toDTO.toGeneratedReportResponseDTO(generatedReport)).thenReturn(dto);

        List<GeneratedReportResponseDTO> result = generatedReportService.listAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getClass()).isEqualTo(GeneratedReportResponseDTO.class);
    }
}
