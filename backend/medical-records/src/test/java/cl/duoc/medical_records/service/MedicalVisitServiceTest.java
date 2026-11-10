package cl.duoc.medical_records.service;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import cl.duoc.medical_records.client.AppointmentsClient;
import cl.duoc.medical_records.client.DoctorsClient;
import cl.duoc.medical_records.dto.DiagnosisResponseDTO;
import cl.duoc.medical_records.dto.CreateMedicalVisitRequestDTO;
import cl.duoc.medical_records.dto.MedicalVisitDetailReponseDTO;
import cl.duoc.medical_records.dto.VitalSignResponseDTO;
import cl.duoc.medical_records.extras.ToDTO;
import cl.duoc.medical_records.model.Diagnoses;
import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.model.MedicalVisit;
import cl.duoc.medical_records.model.VitalSigns;
import cl.duoc.medical_records.repository.DiagnosesRepository;
import cl.duoc.medical_records.repository.MedicalRecordRepository;
import cl.duoc.medical_records.repository.MedicalVisitRepository;
import cl.duoc.medical_records.repository.VitalSignsRepository;
import org.springframework.web.server.ResponseStatusException;

public class MedicalVisitServiceTest {
    @Test
    void rejectsVisitWhenAppointmentBelongsToAnotherDoctor() {
        MedicalRecordRepository records = Mockito.mock(MedicalRecordRepository.class);
        DoctorsClient doctors = Mockito.mock(DoctorsClient.class);
        AppointmentsClient appointments = Mockito.mock(AppointmentsClient.class);
        MedicalVisitRepository visits = Mockito.mock(MedicalVisitRepository.class);
        MedicalRecordService recordService = Mockito.mock(MedicalRecordService.class);
        MedicalVisitService service = new MedicalVisitService(records, doctors, appointments, visits,
                Mockito.mock(DiagnosesRepository.class), Mockito.mock(VitalSignsRepository.class),
                recordService, Mockito.mock(ToDTO.class));

        Mockito.when(visits.existsByAppointmentId(55L)).thenReturn(false);
        Mockito.when(records.existsById(80L)).thenReturn(true);
        Mockito.when(appointments.getAppointment(55L))
                .thenReturn(new AppointmentsClient.AppointmentData(55L, 101L, 22L));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.create(new CreateMedicalVisitRequestDTO(80L, 55L, 33L,
                        LocalDateTime.now(), "consulta", null, "tratamiento")));

        assertEquals(403, exception.getStatusCode().value());
        Mockito.verify(visits, Mockito.never()).save(Mockito.any());
    }

    @Test
    void rejectsVisitWhenAppointmentPatientDiffersFromMedicalRecord() {
        MedicalRecordRepository records = Mockito.mock(MedicalRecordRepository.class);
        DoctorsClient doctors = Mockito.mock(DoctorsClient.class);
        AppointmentsClient appointments = Mockito.mock(AppointmentsClient.class);
        MedicalVisitRepository visits = Mockito.mock(MedicalVisitRepository.class);
        MedicalRecordService recordService = Mockito.mock(MedicalRecordService.class);
        MedicalVisitService service = new MedicalVisitService(records, doctors, appointments, visits,
                Mockito.mock(DiagnosesRepository.class), Mockito.mock(VitalSignsRepository.class),
                recordService, Mockito.mock(ToDTO.class));

        Mockito.when(visits.existsByAppointmentId(55L)).thenReturn(false);
        Mockito.when(records.existsById(80L)).thenReturn(true);
        Mockito.when(appointments.getAppointment(55L))
                .thenReturn(new AppointmentsClient.AppointmentData(55L, 101L, 33L));
        Mockito.when(doctors.doctorIdVerification(33L)).thenReturn(true);
        MedicalRecord record = new MedicalRecord();
        record.setPatientId(202L);
        Mockito.when(recordService.findMedicalRecordEntityById(80L)).thenReturn(record);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.create(new CreateMedicalVisitRequestDTO(80L, 55L, 33L,
                        LocalDateTime.now(), "consulta", null, "tratamiento")));

        assertEquals(403, exception.getStatusCode().value());
        Mockito.verify(visits, Mockito.never()).save(Mockito.any());
    }

    @Test
    void testFindAllByPatientId()
    {
        // Initialization of required arguments for a MedicalVisitService instance
        MedicalRecordRepository medicalRecordRepository = Mockito.mock(MedicalRecordRepository.class);
        DoctorsClient doctorsClient = Mockito.mock(DoctorsClient.class);
        AppointmentsClient appointmentsClient = Mockito.mock(AppointmentsClient.class);
        MedicalVisitRepository medicalVisitRepository = Mockito.mock(MedicalVisitRepository.class);
        DiagnosesRepository diagnosesRepository = Mockito.mock(DiagnosesRepository.class);
        VitalSignsRepository vitalSignsRepository = Mockito.mock(VitalSignsRepository.class);
        MedicalRecordService medicalRecordService = Mockito.mock(MedicalRecordService.class);
        ToDTO toDTO = Mockito.mock(ToDTO.class);

        //Cronstruction of MedicalVisitService Instance
        MedicalVisitService medicalVisitService = new MedicalVisitService(
            medicalRecordRepository,
            doctorsClient,
            appointmentsClient,
            medicalVisitRepository,
            diagnosesRepository,
            vitalSignsRepository,
            medicalRecordService,toDTO);
        
        // Initialization of required arguments for a MedicalVisit instance
        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setPatientId(1L);
        LocalDateTime visitDate = LocalDateTime.now();
        LocalDateTime createdAt = LocalDateTime.now();
        Diagnoses diagnosis = new Diagnoses();
        List<Diagnoses> diagnoses = new ArrayList<>();
        diagnoses.add(diagnosis);
        VitalSigns vitalSign = new VitalSigns();
        List<VitalSigns> vitalSigns = new ArrayList<>();
        vitalSigns.add(vitalSign);

        // Construction and setting values for MedicalVisit instance
        MedicalVisit medicalVisit = new MedicalVisit();
        medicalVisit.setId(1L);
        medicalVisit.setAppointmentId(1L);
        medicalVisit.setDoctorId(1L);
        medicalVisit.setCreatedAt(createdAt);
        medicalVisit.setVisitDate(visitDate);
        medicalVisit.setObservations("OBSERVACIONES DEL SISTEMA");
        medicalVisit.setTreatment("TRATAMIENTO DEL SISTEMA");
        medicalVisit.setVisitReason("RAZÓN DEL SISTEMA");
        medicalVisit.setMedicalRecord(medicalRecord);
        medicalVisit.setDiagnoses(diagnoses);
        medicalVisit.setVitalSigns(vitalSigns);
        
        List<DiagnosisResponseDTO> diagnosisResponseDTOs = new ArrayList<>();
        List<VitalSignResponseDTO> vitalSignResponseDTOs = new ArrayList<>();
        MedicalVisitDetailReponseDTO dto = new MedicalVisitDetailReponseDTO
        (
            1L,
            1L,
            1L,
            visitDate,
            "RAZÓN DEL SISTEMA",
            "OBSERVACIONES DEL SISTEMA",
            "TRATAMIENTO DEL SISTEMA",
            createdAt,
            diagnosisResponseDTOs,
            vitalSignResponseDTOs
        );
        //Mock configuration
        Mockito.when(medicalVisitRepository.findByMedicalRecordPatientId(1L)).thenReturn(List.of(medicalVisit));
        Mockito.when(toDTO.toMedicalVisitDetailReponseDTO(medicalVisit)).thenReturn(dto);
        
        //Test the function
        List<MedicalVisitDetailReponseDTO> result = medicalVisitService.findAllByPatientId(1L);
        
        //Verification of the result
        assertThat(result).hasSize(1);
        assertThat(result.get(0).observations()).isEqualTo("OBSERVACIONES DEL SISTEMA");
    }
}
