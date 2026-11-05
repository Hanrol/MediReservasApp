INSERT INTO notifications (user_id, notification_template_id, notification_channel, notification_title, notification_message, notification_status, sent_at) VALUES
(1, 1, 'EMAIL', 'Bienvenida', 'Hola María, bienvenido a MediReservas. Tu cuenta ha sido creada.', 'SENT', '2026-05-23 09:00:00'),
(2, 2, 'SMS', 'Cita confirmada', 'Tu cita con Dr. López ha sido confirmada para el 20 de mayo a las 10:30.', 'SENT', '2026-05-25 14:00:00'),
(3, NULL, 'INTERNAL', 'Aviso del sistema', 'El sistema estará en mantenimiento el domingo de 2:00 a 4:00 AM.', 'PENDING', NULL),
(4, 3, 'EMAIL', 'Cita cancelada', 'Tu cita del 18 de mayo ha sido cancelada. Contacta para reagendar.', 'SENT', '2026-05-20 08:30:00'),
(5, 4, 'SMS', 'Recordatorio', 'Te recordamos tu cita mañana a las 15:00 con Dra. Martínez.', 'PENDING', NULL);