package cl.duoc.medical_records.extras;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.model.MedicalVisit;

class ToDTOOwnershipTest {
    @Test
    void doctorRecordDetailContainsOnlyVisitsOwnedByThatDoctor() {
        MedicalRecord record = new MedicalRecord();
        record.setId(8L);
        record.setPatientId(101L);

        MedicalVisit ownVisit = visit(record, 21L, 31L);
        MedicalVisit otherVisit = visit(record, 22L, 32L);
        record.setMedicalVisits(List.of(ownVisit, otherVisit));

        var response = new ToDTO().toMedicalRecordDetailResponseDTO(record, 31L);

        assertEquals(1, response.visits().size());
        assertEquals(31L, response.visits().get(0).doctorId());
    }

    private MedicalVisit visit(MedicalRecord record, Long visitId, Long doctorId) {
        MedicalVisit visit = new MedicalVisit();
        visit.setId(visitId);
        visit.setMedicalRecord(record);
        visit.setDoctorId(doctorId);
        visit.setAppointmentId(visitId + 100);
        visit.setVisitDate(LocalDateTime.now());
        visit.setTreatment("treatment");
        visit.setDiagnoses(List.of());
        visit.setVitalSigns(List.of());
        return visit;
    }
}
