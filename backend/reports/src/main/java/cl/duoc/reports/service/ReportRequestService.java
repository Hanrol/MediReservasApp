package cl.duoc.reports.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cl.duoc.reports.client.UsersClient;
import cl.duoc.reports.dto.CreateReportRequestDTO;
import cl.duoc.reports.dto.ReportRequestResponseDTO;
import cl.duoc.reports.extras.ToDTO;
import cl.duoc.reports.model.ReportRequest;
import cl.duoc.reports.repository.ReportRequestRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportRequestService {
    private final ToDTO toDTO;
    private static final Logger logger = LoggerFactory.getLogger(ReportRequestService.class);
    private final UsersClient usersClient;
    private final ReportRequestRepository reportRequestRepository;

    public ReportRequestResponseDTO create(CreateReportRequestDTO requestDTO) {
        if (!usersClient.byUserIdVerification(requestDTO.requestByUserId()))
        {
                logger.warn(
                    "Solicitud de reporte rechazada: ID del usuario no encontrado. userId={}",
                    requestDTO.requestByUserId());

            throw new RuntimeException(
                    "ID del usuario inexistente");
        }
 
        ReportRequest reportRequest = toDTO.toReportRequest(requestDTO);
        reportRequestRepository.save(reportRequest);
        return toDTO.toReportRequestResponseDTO(reportRequest);
    }

    public List<ReportRequestResponseDTO> listAll() {
        return reportRequestRepository.findAll()
                .stream()
                .map(x -> toDTO.toReportRequestResponseDTO(x))
                .collect(Collectors.toList());
    }
}
