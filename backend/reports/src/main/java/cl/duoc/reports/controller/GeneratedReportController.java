package cl.duoc.reports.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.reports.dto.ApiResponse;
import cl.duoc.reports.dto.CreateGeneratedReportRequestDTO;
import cl.duoc.reports.dto.GeneratedReportResponseDTO;
import cl.duoc.reports.service.GeneratedReportService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/generated-reports")
public class GeneratedReportController 
{
    private final GeneratedReportService generatedReportService;
    private static final Logger logger = LoggerFactory.getLogger(GeneratedReportController.class);

    @GetMapping()
    @Operation(summary = "Obtiene la metadata de todos los reportes generados",description = "Permite obtener la metadata de todos los reportes generados en formato json")
    public ResponseEntity<ApiResponse<List<GeneratedReportResponseDTO>>> getAllGeneratedReport()
    {
        try
        {
            
            List<GeneratedReportResponseDTO> generatedReports = generatedReportService.listAll();
            ApiResponse<List<GeneratedReportResponseDTO>> response =
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
            ApiResponse<List<GeneratedReportResponseDTO>> response =
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
    @Operation(summary = "Registra la metadata de un reporte generado",description = "Permite crear la metadata de un reporte generado en formato json")
    public ResponseEntity<ApiResponse<GeneratedReportResponseDTO>> createGeneratedReport(@Valid @RequestBody CreateGeneratedReportRequestDTO requestDTO, @PathVariable Long patientId)
    {
        try
        {

            GeneratedReportResponseDTO generatedReport = generatedReportService.create(requestDTO);
            ApiResponse<GeneratedReportResponseDTO> response =
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
            ApiResponse<GeneratedReportResponseDTO> response =
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
