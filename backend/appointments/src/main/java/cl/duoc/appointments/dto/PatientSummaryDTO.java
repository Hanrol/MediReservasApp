package cl.duoc.appointments.dto;

public record PatientSummaryDTO(Long userId, String run, String firstName, String lastName) {
    public String fullName() {
        return (firstName + " " + lastName).trim();
    }
}
