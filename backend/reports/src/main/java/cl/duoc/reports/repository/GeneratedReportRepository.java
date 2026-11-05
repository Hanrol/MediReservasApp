package cl.duoc.reports.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.reports.model.GeneratedReport;

public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, Long> {

}
