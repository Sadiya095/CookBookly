package com.recipevault.controller;

import com.recipevault.dto.RecipeDtos.RecipeResponse;
import com.recipevault.exception.ResourceNotFoundException;
import com.recipevault.model.User;
import com.recipevault.repository.UserRepository;
import com.recipevault.security.CustomUserDetails;
import com.recipevault.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RecipeService recipeService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal CustomUserDetails user) {
        User u = user.getUser();
        return ResponseEntity.ok(Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail()));
    }

    // Public profile: shows a user's PUBLIC recipes only, regardless of who is viewing.
    @GetMapping("/{name}/recipes")
    public ResponseEntity<Page<RecipeResponse>> publicProfile(@AuthenticationPrincipal CustomUserDetails viewer,
                                                                @PathVariable String name,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "12") int size) {
        User profileUser = userRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long viewerId = viewer == null ? null : viewer.getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(recipeService.getPublicRecipesByUser(profileUser.getId(), viewerId, pageable));
    }
}
