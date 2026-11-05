package cl.duoc.notifications.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import cl.duoc.notifications.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
			MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();

		ex.getBindingResult().getFieldErrors()
				.forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse<>(
						400,
						"Error de validación",
						errors));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Object>> handleInvalidJson(
			HttpMessageNotReadableException ex) {
	
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(new ApiResponse<>(
						400,
						"El cuerpo de la solicitud no tiene un formato JSON válido",
						null));
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiResponse<Object>> handleMethodNotAllowed(
			HttpRequestMethodNotSupportedException ex) {
	
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
				.body(new ApiResponse<>(
						405,
						"Método HTTP no permitido para esta ruta",
						null));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
			DataIntegrityViolationException ex) {

		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(new ApiResponse<>(
						409,
						"Conflicto con los datos enviados. Puede que el registro ya exista",
						null));
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {

		String message = ex.getMessage();
		HttpStatus status = HttpStatus.BAD_REQUEST;
		int code = 400;

		if (message != null && message.toLowerCase().contains("no encontrada")) {
			status = HttpStatus.NOT_FOUND;
			code = 404;
		}

		if (message != null && message.toLowerCase().contains("no encontrado")) {
			status = HttpStatus.NOT_FOUND;
			code = 404;
		}

		if (message != null && message.toLowerCase().contains("ya existe")) {
			status = HttpStatus.CONFLICT;
			code = 409;
		}

	
		return ResponseEntity.status(status)
				.body(new ApiResponse<>(
						code,
						message,
						null));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
	
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse<>(
						500,
						"Error interno del servidor",
						null));
	}
}