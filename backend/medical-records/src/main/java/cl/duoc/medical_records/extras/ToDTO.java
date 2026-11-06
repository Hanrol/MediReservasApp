package cl.duoc.medical_records.extras;

import java.util.List;

import org.springframework.stereotype.Component;

import cl.duoc.medical_records.dto.CreateDiagnosisRequestDTO;
import cl.duoc.medical_records.dto.CreateMedicalRecordRequestDTO;
import cl.duoc.medical_records.dto.CreateMedicalVisitRequestDTO;
import cl.duoc.medical_records.dto.CreateVitalSignRequestDTO;
import cl.duoc.medical_records.dto.DiagnosisResponseDTO;
import cl.duoc.medical_records.dto.MedicalRecordDetailResponseDTO;
import cl.duoc.medical_records.dto.MedicalRecordResponseDTO;
import cl.duoc.medical_records.dto.MedicalVisitDetailReponseDTO;
import cl.duoc.medical_records.dto.MedicalVisitResponseDTO;
import cl.duoc.medical_records.dto.VitalSignResponseDTO;
import cl.duoc.medical_records.model.Diagnoses;
import cl.duoc.medical_records.model.MedicalRecord;
import cl.duoc.medical_records.model.MedicalVisit;
import cl.duoc.medical_records.model.VitalSigns;

@Component
public class ToDTO {

    public MedicalRecord toMedicalRecord(
            CreateMedicalRecordRequestDTO requestDTO) {

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setPatientId(requestDTO.patientId());
        medicalRecord.setActive(true);

        return medicalRecord;
    }

    public MedicalRecordResponseDTO toMedicalRecordResponseDTO(
            MedicalRecord medicalRecord) {

        return new MedicalRecordResponseDTO(
                medicalRecord.getId(),
                medicalRecord.getPatientId(),
                medicalRecord.getActive(),
                medicalRecord.getCreatedAt());
    }

    public MedicalVisit toMedicalVisit(
            CreateMedicalVisitRequestDTO requestDTO) {

        MedicalVisit medicalVisit = new MedicalVisit();

        medicalVisit.setAppointmentId(requestDTO.appointmentId());
        medicalVisit.setDoctorId(requestDTO.doctorId());
        medicalVisit.setVisitDate(requestDTO.visitDate());
        medicalVisit.setVisitReason(requestDTO.visitReason());
        medicalVisit.setObservations(requestDTO.observations());
        medicalVisit.setTreatment(requestDTO.treatment());

        return medicalVisit;
    }

    public MedicalVisitResponseDTO toMedicalVisitResponseDTO(
            MedicalVisit medicalVisit) {

        return new MedicalVisitResponseDTO(
                medicalVisit.getId(),
                medicalVisit.getMedicalRecord().getId(),
                medicalVisit.getAppointmentId(),
                medicalVisit.getDoctorId(),
                medicalVisit.getVisitDate(),
                medicalVisit.getVisitReason(),
                medicalVisit.getObservations(),
                medicalVisit.getTreatment(),
                medicalVisit.getCreatedAt());
    }

    public Diagnoses toDiagnoses(
            CreateDiagnosisRequestDTO requestDTO) {

        Diagnoses diagnosis = new Diagnoses();

        diagnosis.setDiagnosisDescription(
                requestDTO.diagnosisDescription());
        diagnosis.setDiagnosisNotes(
                requestDTO.diagnosisNotes());

        return diagnosis;
    }

    public DiagnosisResponseDTO toDiagnosisResponseDTO(
            Diagnoses diagnosis) {

        return new DiagnosisResponseDTO(
                diagnosis.getId(),
                diagnosis.getMedicalVisit().getId(),
                diagnosis.getDiagnosisDescription(),
                diagnosis.getDiagnosisNotes());
    }

    public VitalSigns toVitalSigns(
            CreateVitalSignRequestDTO requestDTO) {

        VitalSigns vitalSigns = new VitalSigns();

        vitalSigns.setTemperature(requestDTO.temperature());
        vitalSigns.setBloodPressure(requestDTO.bloodPressure());
        vitalSigns.setHeartRate(requestDTO.heartRate());
        vitalSigns.setWeight(requestDTO.weight());
        vitalSigns.setHeight(requestDTO.height());

        return vitalSigns;
    }

    public VitalSignResponseDTO toVitalSignResponseDTO(
            VitalSigns vitalSigns) {

        return new VitalSignResponseDTO(
                vitalSigns.getId(),
                vitalSigns.getMedicalVisit().getId(),
                vitalSigns.getTemperature(),
                vitalSigns.getBloodPressure(),
                vitalSigns.getHeartRate(),
                vitalSigns.getWeight(),
                vitalSigns.getHeight(),
                vitalSigns.getCreatedAt());
    }

    public MedicalVisitDetailReponseDTO toMedicalVisitDetailReponseDTO(
            MedicalVisit medicalVisit) {

        List<DiagnosisResponseDTO> diagnoses = medicalVisit.getDiagnoses() == null
                ? List.of()
                : medicalVisit.getDiagnoses()
                        .stream()
                        .map(this::toDiagnosisResponseDTO)
                        .toList();

        List<VitalSignResponseDTO> vitalSigns = medicalVisit.getVitalSigns() == null
                ? List.of()
                : medicalVisit.getVitalSigns()
                        .stream()
                        .map(this::toVitalSignResponseDTO)
                        .toList();

        return new MedicalVisitDetailReponseDTO(
                medicalVisit.getId(),
                medicalVisit.getAppointmentId(),
                medicalVisit.getDoctorId(),
                medicalVisit.getVisitDate(),
                medicalVisit.getVisitReason(),
                medicalVisit.getObservations(),
                medicalVisit.getTreatment(),
                medicalVisit.getCreatedAt(),
                diagnoses,
                vitalSigns);
    }

    public MedicalRecordDetailResponseDTO toMedicalRecordDetailResponseDTO(
            MedicalRecord medicalRecord) {
        return toMedicalRecordDetailResponseDTO(medicalRecord, null);
    }

    public MedicalRecordDetailResponseDTO toMedicalRecordDetailResponseDTO(
            MedicalRecord medicalRecord, Long doctorId) {

        List<MedicalVisitDetailReponseDTO> visits = medicalRecord.getMedicalVisits() == null
                ? List.of()
                : medicalRecord.getMedicalVisits()
                        .stream()
                        .filter(visit -> doctorId == null || doctorId.equals(visit.getDoctorId()))
                        .map(this::toMedicalVisitDetailReponseDTO)
                        .toList();

        return new MedicalRecordDetailResponseDTO(
                medicalRecord.getId(),
                medicalRecord.getPatientId(),
                Boolean.TRUE.equals(medicalRecord.getActive()),
                medicalRecord.getCreatedAt(),
                visits);
    }
}
