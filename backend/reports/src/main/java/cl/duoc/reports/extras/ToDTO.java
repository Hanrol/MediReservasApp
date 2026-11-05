package cl.duoc.reports.extras;

import org.springframework.stereotype.Component;

import cl.duoc.reports.dto.CreateGeneratedReportRequestDTO;
import cl.duoc.reports.dto.CreateReportRequestDTO;
import cl.duoc.reports.dto.GeneratedReportResponseDTO;
import cl.duoc.reports.dto.ReportRequestResponseDTO;
import cl.duoc.reports.model.GeneratedReport;
import cl.duoc.reports.model.ReportRequest;
import cl.duoc.reports.repository.ReportRequestRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ToDTO 
{ 
    private final ReportRequestRepository reportRequestRepository;

    public ReportRequest toReportRequest(CreateReportRequestDTO requestDTO)
    {
        ReportRequest reportRequest = new ReportRequest();
        reportRequest.setReportType(requestDTO.reportType());
        reportRequest.setRequestedByUserId(requestDTO.requestByUserId());
        reportRequest.setStartDate(requestDTO.startDAte());
        reportRequest.setEndDate(requestDTO.endDate());
        return reportRequest;
    }

    public ReportRequestResponseDTO toReportRequestResponseDTO(ReportRequest reportRequest)
    {
        return new ReportRequestResponseDTO
        (
            reportRequest.getId(),
            reportRequest.getReportType(),
            reportRequest.getRequestedByUserId(),
            reportRequest.getStartDate(),
            reportRequest.getEndDate(),
            reportRequest.getRequestStatus(),
            reportRequest.getCreatedAt()
        );
    }

    public GeneratedReport toGeneratedReport(CreateGeneratedReportRequestDTO requestDTO)
    {
        GeneratedReport generatedReport = new GeneratedReport();
        generatedReport.setReportRequest(reportRequestRepository
            .findById(requestDTO.reportRequestId())
        .orElseThrow(() -> new RuntimeException("No se ha encontrado una petición de reporte con ese ID.")));
        generatedReport.setGeneratedByUserId(requestDTO.generatedByUserID());
        generatedReport.setReportType(requestDTO.reportType());
        generatedReport.setReportFormat(requestDTO.reportFormat());
        generatedReport.setFilePath(requestDTO.filePath());
        return generatedReport;
    }

    public GeneratedReportResponseDTO toGeneratedReportResponseDTO(GeneratedReport generatedReport)
    {
        return new GeneratedReportResponseDTO
        (
            generatedReport.getId(),
            generatedReport.getReportRequest().getId(),
            generatedReport.getGeneratedByUserId(),
            generatedReport.getReportType(),
            generatedReport.getGeneratedAt(),
            generatedReport.getReportFormat(),
            generatedReport.getFilePath(),
            generatedReport.getReportStatus()

        );
    }
}
