package com.recipevault.service;

import com.recipevault.dto.RecipeDtos.RecipeResponse;
import com.recipevault.exception.ResourceNotFoundException;
import com.recipevault.model.Recipe;
import com.recipevault.model.SavedRecipe;
import com.recipevault.model.User;
import com.recipevault.repository.RecipeRepository;
import com.recipevault.repository.SavedRecipeRepository;
import com.recipevault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SavedRecipeService {

    private final SavedRecipeRepository savedRecipeRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Transactional
    public void saveRecipe(Long userId, Long recipeId) {
        if (savedRecipeRepository.existsByUserIdAndRecipeId(userId, recipeId)) {
            return; // idempotent
        }

        // Only public recipes (or the user's own) can be bookmarked.
        Recipe recipe = recipeRepository.findAccessibleById(recipeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found or is private"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SavedRecipe saved = SavedRecipe.builder()
                .user(user)
                .recipe(recipe)
                .build();

        savedRecipeRepository.save(saved);
    }

    @Transactional
    public void unsaveRecipe(Long userId, Long recipeId) {
        savedRecipeRepository.deleteByUserIdAndRecipeId(userId, recipeId);
    }

    public Page<RecipeResponse> getSavedRecipes(Long userId, Pageable pageable) {
        return savedRecipeRepository.findByUserId(userId, pageable)
                .map(sr -> toResponse(sr.getRecipe(), userId));
    }

    private RecipeResponse toResponse(Recipe recipe, Long currentUserId) {
        return RecipeResponse.builder()
                .id(recipe.getId())
                .userId(recipe.getUser().getId())
                .authorName(recipe.getUser().getName())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .ingredients(recipe.getIngredients())
                .instructions(recipe.getInstructions())
                .imageUrl(recipe.getImageUrl())
                .recipeUrl(recipe.getRecipeUrl())
                .category(recipe.getCategory())
                .cookingTime(recipe.getCookingTime())
                .servings(recipe.getServings())
                .difficulty(recipe.getDifficulty())
                .visibility(recipe.getVisibility())
                .savedByCurrentUser(true)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }
}
