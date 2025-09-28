package com.civica.onlineStore.dto;

import java.time.LocalDate;

public class CustomerDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate registrationDate;
    private Boolean active;
    private Long userId;

    // Constructores
    public CustomerDTO() {}
    
    public CustomerDTO(Long id, String firstName, String lastName, String email, 
                      String phone, LocalDate registrationDate, Boolean active, Long userId) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.registrationDate = registrationDate;
        this.active = active;
        this.userId = userId;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}