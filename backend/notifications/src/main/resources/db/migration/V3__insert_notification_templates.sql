INSERT INTO notification_templates (template_code, template_title, template_body) VALUES
('BIENVENIDA', 'Bienvenida al sistema', 'Hola {nombre}, bienvenido a MediReservas. Tu cuenta ha sido creada exitosamente.'),
('CITA_CONFIRMADA', 'Confirmación de cita', 'Tu cita con el Dr. {doctor} ha sido confirmada para el día {fecha} a las {hora}.'),
('CITA_CANCELADA', 'Cancelación de cita', 'Lamentamos informarte que tu cita del día {fecha} ha sido cancelada. Contacta para reagendar.'),
('RECORDATORIO_CITA', 'Recordatorio de cita', 'Te recordamos que tienes una cita mañana a las {hora} con el Dr. {doctor}.'),
('REAGENDAMIENTO_CITA', 'Reagendamiento de cita', 'Tu cita ha sido reagendada para el día {fecha} a las {hora}. Confirma tu asistencia.');