export interface ClinicalObservation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  notes: string;
  treatment: string;
  createdAt: string;
}

export interface ClinicalHistory {
  patientId: string;
  observations: ClinicalObservation[];
}