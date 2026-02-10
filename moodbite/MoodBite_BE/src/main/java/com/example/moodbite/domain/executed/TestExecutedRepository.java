package com.example.moodbite.domain.executed;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestExecutedRepository extends JpaRepository<TestExecuted, Long> {
}
