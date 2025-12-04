package com.ems.employee;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> findAll() { return repository.findAll(); }

    public Employee findById(Long id) { return repository.findById(id).orElse(null); }

    public Employee create(Employee employee) { return repository.save(employee); }

    public Employee update(Long id, Employee updated) {
        Employee existing = findById(id);
        if (existing == null) return null;
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setRole(updated.getRole());
        existing.setSalary(updated.getSalary());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.deleteById(id); }
}
