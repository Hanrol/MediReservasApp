package cl.duoc.reports.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.reports.dto.ApiResponse;
import cl.duoc.reports.dto.CreateReportRequestDTO; 
import cl.duoc.reports.dto.ReportRequestResponseDTO;
import cl.duoc.reports.service.ReportRequestService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports-request")
public class ReportRequestController 
{
    private final ReportRequestService reportRequestService;
    private static final Logger logger = LoggerFactory.getLogger(ReportRequestController.class);

    @GetMapping()
    @Operation(summary = "Obtiene toda la metadata de las solicitudes de reportes",description = "Permite listar todas la metadata de las solicitudes de reportes en formato json")
    public ResponseEntity<ApiResponse<List<ReportRequestResponseDTO>>> getAllGeneratedReport()
    {
        try
        {
            List<ReportRequestResponseDTO> generatedReports = reportRequestService.listAll();
            ApiResponse<List<ReportRequestResponseDTO>> response =
                new ApiResponse<>
                (
                    200,
                    "Listado de reportes generados",
                    generatedReports
                );
            return ResponseEntity.ok(response);
        }
        catch (Exception e)
        {
            logger.error("Error al registrar signos vitales: {}", e.getMessage());
            ApiResponse<List<ReportRequestResponseDTO>> response =
                new ApiResponse<>
                (
                    400,
                    "Error al registrar signos vitales: " + e.getMessage(),
                    null
                );
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping()
    @Operation(summary = "Registra la metadata de una solicitud de reporte",description = "Permite registrar la metadata de una solicitud de reporte y guardarla en formato json")
    public ResponseEntity<ApiResponse<ReportRequestResponseDTO>> createGeneratedReport(@Valid @RequestBody CreateReportRequestDTO requestDTO)
    {
        try
        {
            ReportRequestResponseDTO generatedReport = reportRequestService.create(requestDTO);
            ApiResponse<ReportRequestResponseDTO> response =
                new ApiResponse<>
                (
                    200,
                    "Reporte generado creado",
                    generatedReport
                );
            return ResponseEntity.ok(response);
        }
        catch (Exception e)
        {
            logger.error("Error al registrar signos vitales: {}", e.getMessage());
            ApiResponse<ReportRequestResponseDTO> response =
                new ApiResponse<>
                (
                    400,
                    "Error al registrar signos vitales: " + e.getMessage(),
                    null
                );
            return ResponseEntity.badRequest().body(response);
        }

    }
}
