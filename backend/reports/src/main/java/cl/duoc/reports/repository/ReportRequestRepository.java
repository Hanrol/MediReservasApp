package cl.duoc.reports.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.reports.model.ReportRequest;

public interface ReportRequestRepository extends JpaRepository<ReportRequest, Long> {

}
