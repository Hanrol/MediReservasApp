package cl.duoc.reports.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cl.duoc.reports.client.UsersClient;
import cl.duoc.reports.dto.CreateGeneratedReportRequestDTO;
import cl.duoc.reports.dto.GeneratedReportResponseDTO;
import cl.duoc.reports.extras.ToDTO;
import cl.duoc.reports.model.GeneratedReport;
import cl.duoc.reports.repository.GeneratedReportRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GeneratedReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportRequestService.class);
    private final ToDTO toDTO;
    private final GeneratedReportRepository generatedReportsRepository;
    private final UsersClient usersClient;
    public GeneratedReportResponseDTO create(CreateGeneratedReportRequestDTO requestDTO) 
    {
        if (!usersClient.byUserIdVerification(requestDTO.generatedByUserID()))
        {
                logger.warn(
                    "Solicitud de reporte rechazada: ID del usuario no encontrado. userId={}",
                    requestDTO.generatedByUserID());

            throw new RuntimeException(
                    "ID del usuario inexistente");
        }
        GeneratedReport generatedReport = toDTO.toGeneratedReport(requestDTO);
        generatedReportsRepository.save(generatedReport);
        return toDTO.toGeneratedReportResponseDTO(generatedReport);
    }

    public List<GeneratedReportResponseDTO> listAll() {
        return generatedReportsRepository.findAll()
                .stream()
                .map(x -> toDTO.toGeneratedReportResponseDTO(x))
                .collect(Collectors.toList());
    }
}
