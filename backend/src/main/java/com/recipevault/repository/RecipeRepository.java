package com.recipevault.repository;

import com.recipevault.model.Recipe;
import com.recipevault.model.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Page<Recipe> findByVisibility(Visibility visibility, Pageable pageable);

    Page<Recipe> findByUserId(Long userId, Pageable pageable);

    Page<Recipe> findByUserIdAndVisibility(Long userId, Visibility visibility, Pageable pageable);

    /**
     * Privacy-enforcing search.
     *
     * Returns recipes whose title/ingredients/category match the query AND
     * ( the recipe is PUBLIC  OR  the recipe belongs to the currently logged-in user ).
     *
     * When currentUserId is null (anonymous / logged-out visitor), only PUBLIC
     * recipes are ever returned, regardless of what matches.
     */
    @Query("""
            SELECT r FROM Recipe r
            WHERE (LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(CAST(r.ingredients AS String)) LIKE LOWER(CONCAT('%', :query, '%'))
                   OR LOWER(r.category) LIKE LOWER(CONCAT('%', :query, '%')))
              AND (
                    r.visibility = :publicVisibility
                    OR (:currentUserId IS NOT NULL AND r.user.id = :currentUserId)
                  )
            """)
    Page<Recipe> searchAccessible(@Param("query") String query,
                                   @Param("currentUserId") Long currentUserId,
                                   @Param("publicVisibility") Visibility publicVisibility,
                                   Pageable pageable);

    /**
     * Fetch a single recipe only if it is accessible to the requester:
     * public, or private-but-owned-by-them. Used for the recipe detail page.
     */
    @Query("""
            SELECT r FROM Recipe r
            WHERE r.id = :id
              AND (
                    r.visibility = com.recipevault.model.Visibility.PUBLIC
                    OR (:currentUserId IS NOT NULL AND r.user.id = :currentUserId)
                  )
            """)
    java.util.Optional<Recipe> findAccessibleById(@Param("id") Long id,
                                                   @Param("currentUserId") Long currentUserId);
}
