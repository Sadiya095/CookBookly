package com.recipevault.dto;

import com.recipevault.model.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class RecipeDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotBlank(message = "Ingredients are required")
        private String ingredients;

        @NotBlank(message = "Instructions are required")
        private String instructions;

        private String imageUrl;
        private String recipeUrl;
        private String category;
        private String cookingTime;
        private String servings;
        private String difficulty;

        // "PUBLIC" or "PRIVATE" - defaults to PUBLIC if omitted
        private Visibility visibility;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeResponse {
        private Long id;
        private Long userId;
        private String authorName;
        private String title;
        private String description;
        private String ingredients;
        private String instructions;
        private String imageUrl;
        private String recipeUrl;
        private String category;
        private String cookingTime;
        private String servings;
        private String difficulty;
        private Visibility visibility;
        private boolean savedByCurrentUser;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
