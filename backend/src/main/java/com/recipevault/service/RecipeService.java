package com.recipevault.service;

import com.recipevault.dto.RecipeDtos.RecipeRequest;
import com.recipevault.dto.RecipeDtos.RecipeResponse;
import com.recipevault.exception.ForbiddenException;
import com.recipevault.exception.ResourceNotFoundException;
import com.recipevault.model.Recipe;
import com.recipevault.model.User;
import com.recipevault.model.Visibility;
import com.recipevault.repository.RecipeRepository;
import com.recipevault.repository.SavedRecipeRepository;
import com.recipevault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final SavedRecipeRepository savedRecipeRepository;

    public RecipeResponse createRecipe(Long userId, RecipeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Recipe recipe = Recipe.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .ingredients(request.getIngredients())
                .instructions(request.getInstructions())
                .imageUrl(request.getImageUrl())
                .recipeUrl(request.getRecipeUrl())
                .category(request.getCategory())
                .cookingTime(request.getCookingTime())
                .servings(request.getServings())
                .difficulty(request.getDifficulty())
                .visibility(request.getVisibility() == null ? Visibility.PUBLIC : request.getVisibility())
                .build();

        return toResponse(recipeRepository.save(recipe), userId);
    }

    public RecipeResponse updateRecipe(Long userId, Long recipeId, RecipeRequest request) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        if (!recipe.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own recipes");
        }

        recipe.setTitle(request.getTitle());
        recipe.setDescription(request.getDescription());
        recipe.setIngredients(request.getIngredients());
        recipe.setInstructions(request.getInstructions());
        recipe.setImageUrl(request.getImageUrl());
        recipe.setRecipeUrl(request.getRecipeUrl());
        recipe.setCategory(request.getCategory());
        recipe.setCookingTime(request.getCookingTime());
        recipe.setServings(request.getServings());
        recipe.setDifficulty(request.getDifficulty());
        if (request.getVisibility() != null) {
            recipe.setVisibility(request.getVisibility());
        }

        return toResponse(recipeRepository.save(recipe), userId);
    }

    public void deleteRecipe(Long userId, Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        if (!recipe.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own recipes");
        }

        recipeRepository.delete(recipe);
    }

    /**
     * Fetch a single recipe's detail. Enforces: public recipes are visible to
     * anyone; private recipes are visible only to their owner.
     */
    public RecipeResponse getRecipeById(Long recipeId, Long currentUserId) {
        Recipe recipe = recipeRepository.findAccessibleById(recipeId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found or is private"));
        return toResponse(recipe, currentUserId);
    }

    /**
     * Explore feed: public recipes from everyone.
     */
    public Page<RecipeResponse> getPublicFeed(Pageable pageable, Long currentUserId) {
        return recipeRepository.findByVisibility(Visibility.PUBLIC, pageable)
                .map(r -> toResponse(r, currentUserId));
    }

    /**
     * "My Recipes" - everything the logged-in user owns, public or private.
     */
    public Page<RecipeResponse> getMyRecipes(Long userId, Pageable pageable) {
        return recipeRepository.findByUserId(userId, pageable)
                .map(r -> toResponse(r, userId));
    }

    /**
     * Public profile page for another user: only their PUBLIC recipes.
     */
    public Page<RecipeResponse> getPublicRecipesByUser(Long profileUserId, Long currentUserId, Pageable pageable) {
        return recipeRepository.findByUserIdAndVisibility(profileUserId, Visibility.PUBLIC, pageable)
                .map(r -> toResponse(r, currentUserId));
    }

    /**
     * Privacy-enforced search across title / ingredients / category.
     * See RecipeRepository#searchAccessible for the enforcement rule:
     * matches PUBLIC recipes from anyone, plus PRIVATE + PUBLIC recipes
     * owned by the current user. Anonymous callers only ever see PUBLIC.
     */
    public Page<RecipeResponse> search(String query, Long currentUserId, Pageable pageable) {
        return recipeRepository.searchAccessible(query, currentUserId, Visibility.PUBLIC, pageable)
                .map(r -> toResponse(r, currentUserId));
    }

    private RecipeResponse toResponse(Recipe recipe, Long currentUserId) {
        boolean saved = currentUserId != null &&
                savedRecipeRepository.existsByUserIdAndRecipeId(currentUserId, recipe.getId());

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
                .savedByCurrentUser(saved)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }
}
