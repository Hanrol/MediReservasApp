export interface ClinicalObservation {
  id: string;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  notes: string;
  treatment: string;
  createdAt: string;
}

export interface ClinicalConsultation {
  id: string;
  patientName: string;
  patientRun: string;
  doctorName: string;
  specialtyName: string;
  date: string;
  reason: string;
  diagnosis: string;
  observations: string;
  treatment: string;
}
