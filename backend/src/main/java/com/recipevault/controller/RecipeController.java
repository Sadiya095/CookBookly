package com.recipevault.controller;

import com.recipevault.dto.RecipeDtos.RecipeRequest;
import com.recipevault.dto.RecipeDtos.RecipeResponse;
import com.recipevault.security.CustomUserDetails;
import com.recipevault.service.FileStorageService;
import com.recipevault.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final FileStorageService fileStorageService;

    // ---- Create ----
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RecipeResponse> createRecipe(@AuthenticationPrincipal CustomUserDetails user,
                                                         @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(recipeService.createRecipe(user.getId(), request));
    }

    // ---- Image upload (returns a URL to place into RecipeRequest.imageUrl) ----
    @PostMapping("/upload-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }

    // ---- Update ----
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RecipeResponse> updateRecipe(@AuthenticationPrincipal CustomUserDetails user,
                                                         @PathVariable Long id,
                                                         @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(recipeService.updateRecipe(user.getId(), id, request));
    }

    // ---- Delete ----
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteRecipe(@AuthenticationPrincipal CustomUserDetails user,
                                              @PathVariable Long id) {
        recipeService.deleteRecipe(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // ---- Single recipe (public, or private+owned) ----
    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipe(@AuthenticationPrincipal CustomUserDetails user,
                                                      @PathVariable Long id) {
        Long currentUserId = user == null ? null : user.getId();
        return ResponseEntity.ok(recipeService.getRecipeById(id, currentUserId));
    }

    // ---- Explore feed: public recipes from everyone ----
    @GetMapping("/explore")
    public ResponseEntity<Page<RecipeResponse>> explore(@AuthenticationPrincipal CustomUserDetails user,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "12") int size) {
        Long currentUserId = user == null ? null : user.getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(recipeService.getPublicFeed(pageable, currentUserId));
    }

    // ---- My Recipes (own, public + private) ----
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<RecipeResponse>> myRecipes(@AuthenticationPrincipal CustomUserDetails user,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(recipeService.getMyRecipes(user.getId(), pageable));
    }

    // ---- Privacy-enforced search: title / ingredient / category ----
    @GetMapping("/search")
    public ResponseEntity<Page<RecipeResponse>> search(@AuthenticationPrincipal CustomUserDetails user,
                                                         @RequestParam String query,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "12") int size) {
        Long currentUserId = user == null ? null : user.getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(recipeService.search(query, currentUserId, pageable));
    }
}
