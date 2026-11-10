package cl.duoc.medical_records.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import cl.duoc.medical_records.client.UsersClient;
import cl.duoc.medical_records.extras.ToDTO;
import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.model.MedicalVisit;
import cl.duoc.medical_records.repository.MedicalRecordRepository;
import cl.duoc.medical_records.repository.MedicalVisitRepository;

@DataJpaTest
@ActiveProfiles("test")
class MedicalRecordDoctorScopeIntegrationTest {
    @Autowired
    private MedicalRecordRepository records;

    @Autowired
    private MedicalVisitRepository visits;

    private MedicalRecordService service;

    @BeforeEach
    void setUp() {
        service = new MedicalRecordService(org.mockito.Mockito.mock(UsersClient.class), records, visits, new ToDTO());
    }

    @Test
    void eachDoctorSeesOnlyTheirVisitsWithinARecordContainingBothDoctors() {
        MedicalRecord record = new MedicalRecord();
        record.setPatientId(9001L);
        record.setActive(true);
        record.setMedicalVisits(new ArrayList<>());
        record = records.saveAndFlush(record);

        MedicalVisit firstDoctorVisit = visit(record, 301L, 401L);
        MedicalVisit secondDoctorVisit = visit(record, 302L, 402L);
        record.getMedicalVisits().addAll(List.of(firstDoctorVisit, secondDoctorVisit));
        visits.saveAllAndFlush(List.of(firstDoctorVisit, secondDoctorVisit));

        var firstDoctorRecords = service.listAllForDoctor(301L);
        var secondDoctorRecords = service.listAllForDoctor(302L);
        var unrelatedDoctorRecords = service.listAllForDoctor(399L);

        assertEquals(1, firstDoctorRecords.size());
        assertEquals(List.of(301L), firstDoctorRecords.get(0).visits().stream()
                .map(visit -> visit.doctorId()).toList());
        assertEquals(1, secondDoctorRecords.size());
        assertEquals(List.of(302L), secondDoctorRecords.get(0).visits().stream()
                .map(visit -> visit.doctorId()).toList());
        assertEquals(List.of(), unrelatedDoctorRecords);
    }

    private MedicalVisit visit(MedicalRecord record, Long doctorId, Long appointmentId) {
        MedicalVisit visit = new MedicalVisit();
        visit.setMedicalRecord(record);
        visit.setDoctorId(doctorId);
        visit.setAppointmentId(appointmentId);
        visit.setVisitDate(LocalDateTime.now().minusDays(1));
        visit.setVisitReason("Consulta de prueba aislada");
        visit.setTreatment("Tratamiento de prueba");
        return visit;
    }
}
