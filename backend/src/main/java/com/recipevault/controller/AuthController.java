package com.recipevault.controller;

import com.recipevault.dto.AuthDtos.AuthResponse;
import com.recipevault.dto.AuthDtos.LoginRequest;
import com.recipevault.dto.AuthDtos.RegisterRequest;
import com.recipevault.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @GetMapping("/health")
public ResponseEntity<String> health() {
    return ResponseEntity.ok("CookBookly backend is healthy");
}
}