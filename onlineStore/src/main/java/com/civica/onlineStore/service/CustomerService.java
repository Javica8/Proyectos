package com.civica.onlineStore.service;

import com.civica.onlineStore.dto.CustomerDTO;
import com.civica.onlineStore.model.Customer;
import com.civica.onlineStore.model.User;
import com.civica.onlineStore.repository.CustomerRepository;
import com.civica.onlineStore.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    public List<CustomerDTO> findAll() {
        return customerRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public CustomerDTO findById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        return convertToDTO(customer);
    }

    public CustomerDTO save(CustomerDTO customerDTO) {
        Customer customer = new Customer();
        return saveOrUpdateCustomer(customer, customerDTO);
    }

    public CustomerDTO update(Long id, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found"));
        return saveOrUpdateCustomer(customer, customerDTO);
    }

    public void delete(Long id) {
        customerRepository.deleteById(id);
    }

    public List<CustomerDTO> findAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return customerRepository.findAll(pageable)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public long count() {
        return customerRepository.count();
    }

    private CustomerDTO saveOrUpdateCustomer(Customer customer, CustomerDTO customerDTO) {
        customer.setFirstName(customerDTO.getFirstName());
        customer.setLastName(customerDTO.getLastName());
        customer.setEmail(customerDTO.getEmail());
        customer.setPhone(customerDTO.getPhone());
        customer.setRegistrationDate(customerDTO.getRegistrationDate() != null ? 
            customerDTO.getRegistrationDate() : LocalDate.now());
        customer.setActive(customerDTO.getActive() != null ? customerDTO.getActive() : true);

        if (customerDTO.getUserId() != null) {
            User user = userRepository.findById(customerDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            customer.setUser(user);
        }

        Customer savedCustomer = customerRepository.save(customer);
        return convertToDTO(savedCustomer);
    }

    private CustomerDTO convertToDTO(Customer customer) {
        return new CustomerDTO(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getRegistrationDate(),
            customer.getActive(),
            customer.getUser() != null ? customer.getUser().getId() : null
        );
    }
}