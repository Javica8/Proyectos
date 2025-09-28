package com.civica.onlineStore.controller;

import com.civica.onlineStore.dto.CustomerDTO;
import com.civica.onlineStore.service.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerDTO> getAll(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return customerService.findAllPaged(page, size);
    }

    @GetMapping("/{id}")
    public CustomerDTO getById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @PostMapping
    public CustomerDTO create(@RequestBody CustomerDTO customerDTO) {
        return customerService.save(customerDTO);
    }

    @PutMapping("/{id}")
    public CustomerDTO update(@PathVariable Long id, @RequestBody CustomerDTO customerDTO) {
        return customerService.update(id, customerDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }

    @GetMapping("/count")
    public long countCustomers() {
        return customerService.count();
    }
}