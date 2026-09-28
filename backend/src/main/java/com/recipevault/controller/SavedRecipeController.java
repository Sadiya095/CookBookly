package com.recipevault.controller;

import com.recipevault.dto.RecipeDtos.RecipeResponse;
import com.recipevault.security.CustomUserDetails;
import com.recipevault.service.SavedRecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saved-recipes")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SavedRecipeController {

    private final SavedRecipeService savedRecipeService;

    @PostMapping("/{recipeId}")
    public ResponseEntity<Void> save(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long recipeId) {
        savedRecipeService.saveRecipe(user.getId(), recipeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> unsave(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long recipeId) {
        savedRecipeService.unsaveRecipe(user.getId(), recipeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<RecipeResponse>> mySaved(@AuthenticationPrincipal CustomUserDetails user,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "savedAt"));
        return ResponseEntity.ok(savedRecipeService.getSavedRecipes(user.getId(), pageable));
    }
}
