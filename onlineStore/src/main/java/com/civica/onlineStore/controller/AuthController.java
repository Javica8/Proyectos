package com.civica.onlineStore.controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.civica.onlineStore.config.JwtTokenProvider;
import com.civica.onlineStore.model.User;
import com.civica.onlineStore.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, 
                        JwtTokenProvider tokenProvider, 
                        UserRepository userRepository, 
                        PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
            ));
            
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Credenciales inválidas");
        }
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User newUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Usuario registrado exitosamente");
        response.put("user", Map.of(
            "id", newUser.getId(),
            "email", newUser.getEmail(),
            "role", newUser.getRole()
        ));
        
        return response;
    }
}