package cl.duoc.reports.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List; 

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.assertj.core.api.Assertions.assertThat;

import cl.duoc.reports.client.UsersClient;
import cl.duoc.reports.dto.ReportRequestResponseDTO;
import cl.duoc.reports.extras.ToDTO;
import cl.duoc.reports.model.ReportRequest;
import cl.duoc.reports.repository.ReportRequestRepository;

public class ReportRequestServiceTest {
    @Test
    void testFindById()
    { 
        ReportRequestRepository reportRequestRepository = Mockito.mock(ReportRequestRepository.class);
        UsersClient usersClient = Mockito.mock(UsersClient.class);
        ToDTO toDTO = Mockito.mock(ToDTO.class);
        ReportRequestService reportRequestService = new ReportRequestService(toDTO, usersClient, reportRequestRepository);

        ReportRequest reportRequest = new ReportRequest();
        ReportRequestResponseDTO dto = new ReportRequestResponseDTO(1L, "TIPO DEL SISTEMA", 1L, LocalDate.now(), LocalDate.now(), "ESTADO DEL SISTEMA", LocalDateTime.now());

        Mockito.when(reportRequestRepository.findAll()).thenReturn(List.of(reportRequest));
        Mockito.when(toDTO.toReportRequestResponseDTO(reportRequest)).thenReturn(dto);

        List<ReportRequestResponseDTO> result = reportRequestService.listAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getClass()).isEqualTo(ReportRequestResponseDTO.class);
    }
}
