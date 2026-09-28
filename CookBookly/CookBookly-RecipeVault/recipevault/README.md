# CookBookly (RecipeVault)

**Save Recipes. Share Flavors.** ♡

A full-stack recipe-management app: React frontend, Spring Boot + JWT backend, MySQL database. Users register, create public or private recipes (text, image, or link), search across the whole community with privacy correctly enforced, and bookmark other people's public recipes.

Built as a portfolio project to demonstrate: Java, Spring Boot, Spring Security + JWT, Spring Data JPA/Hibernate, REST API design, MySQL, React, and Git/GitHub workflow.

---

## Tech stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18 + Vite                      |
| Backend        | Java 17 + Spring Boot 3              |
| API            | REST (JSON)                          |
| Database       | MySQL 8                              |
| Authentication | Spring Security + JWT (jjwt)         |
| ORM            | Spring Data JPA / Hibernate          |
| Image storage  | Local disk (`/uploads`) — swappable for Cloudinary/S3 later |
| Build tool     | Maven                                |

## Architecture

```
React Frontend  →  REST API  →  Spring Boot Controllers
                                       ↓
                              Spring Security + JWT Filter
                                       ↓
                                  Service Layer
                                       ↓
                           Spring Data JPA Repositories
                                       ↓
                                   MySQL
```

## Project structure

```
recipevault/
├── docker-compose.yml       # Wires mysql + backend + frontend together
├── .env.example             # Copy to .env for MYSQL_ROOT_PASSWORD / APP_JWT_SECRET
├── backend/                # Spring Boot API
│   ├── Dockerfile           # Multi-stage: Maven build → slim JRE runtime
│   ├── pom.xml
│   └── src/main/java/com/recipevault/
│       ├── config/         # SecurityConfig, WebConfig (static /uploads mapping)
│       ├── security/       # JwtUtil, JwtAuthenticationFilter, CustomUserDetails(Service)
│       ├── model/          # User, Recipe, SavedRecipe, Visibility
│       ├── repository/     # Spring Data JPA repos (privacy-enforcing search query lives here)
│       ├── dto/            # Request/response DTOs
│       ├── service/        # AuthService, RecipeService, SavedRecipeService, FileStorageService
│       ├── controller/     # AuthController, RecipeController, SavedRecipeController, UserController
│       └── exception/      # Global exception handling
├── frontend/                # React (Vite) SPA
│   ├── Dockerfile           # Multi-stage: npm build → Nginx runtime
│   ├── nginx.conf           # Serves the SPA, proxies /api and /uploads to backend
│   └── src/
│       ├── api/             # Axios client with JWT interceptor
│       ├── context/         # AuthContext (login/register/logout, persisted session)
│       ├── components/      # Navbar, RecipeCard, ProtectedRoute
│       ├── pages/           # Home, Login, Register, Explore, MyRecipes, SavedRecipes,
│       │                    # CreateRecipe, EditRecipe, RecipeDetail, Profile
│       └── styles/theme.css # Lavender design system
└── database/
    └── schema.sql           # Reference schema (Hibernate also auto-creates this via ddl-auto=update)
```

## Pages / routes

| Route              | Description                                  |
|---------------------|-----------------------------------------------|
| `/`                 | Landing page                                  |
| `/login`            | Login                                         |
| `/register`         | Sign up                                       |
| `/explore`          | Public recipe feed + search                   |
| `/my-recipes`       | Logged-in user's own recipes (public+private) |
| `/saved-recipes`    | Recipes the user has bookmarked               |
| `/create-recipe`    | Create a recipe                               |
| `/recipe/:id`       | Recipe detail                                 |
| `/edit-recipe/:id`  | Edit a recipe you own                         |
| `/profile/:username`| Public profile — that user's PUBLIC recipes only |

## Database design

**users** — `id, name, email (unique), password (BCrypt hash), created_at`

**recipes** — `id, user_id, title, description, ingredients, instructions, image_url, recipe_url, category, visibility (PUBLIC/PRIVATE), created_at, updated_at`

**saved_recipes** — `id, user_id, recipe_id, saved_at` (bookmark join table, unique on `user_id + recipe_id`)

```
User ── creates ──> Recipes
User ── saves   ──> Recipes (via saved_recipes)
```

## How privacy is enforced

This is the detail worth pointing out in an interview: privacy is enforced **server-side, at the query level**, not just hidden in the UI.

`RecipeRepository.searchAccessible` (and `findAccessibleById`) run a JPQL query that only ever returns:

```
recipe.visibility = PUBLIC
   OR (currentUserId IS NOT NULL AND recipe.user.id = currentUserId)
```

So `GET /api/recipes/search?query=chicken`:
- Always includes matching **public** recipes from any user.
- Additionally includes the **logged-in user's own private matches**.
- Never returns another user's private recipes, no matter what matches.
- An anonymous (logged-out) caller only ever sees public recipes.

The same rule protects the single-recipe detail endpoint and bookmarking (you can't save a recipe you're not allowed to see).

## API overview

| Method | Endpoint                          | Auth      | Notes |
|--------|-------------------------------------|-----------|-------|
| POST   | `/api/auth/register`               | Public    | Returns JWT |
| POST   | `/api/auth/login`                  | Public    | Returns JWT |
| POST   | `/api/recipes`                     | Required  | Create recipe |
| PUT    | `/api/recipes/{id}`                | Required  | Owner only |
| DELETE | `/api/recipes/{id}`                | Required  | Owner only |
| GET    | `/api/recipes/{id}`                | Optional  | 404 if private and not owner |
| GET    | `/api/recipes/explore`             | Optional  | Public feed |
| GET    | `/api/recipes/search?query=`       | Optional  | Privacy-enforced search |
| GET    | `/api/recipes/my`                  | Required  | Own recipes, public+private |
| POST   | `/api/recipes/upload-image`        | Required  | multipart/form-data |
| POST   | `/api/saved-recipes/{recipeId}`    | Required  | Bookmark |
| DELETE | `/api/saved-recipes/{recipeId}`    | Required  | Remove bookmark |
| GET    | `/api/saved-recipes`               | Required  | List bookmarks |
| GET    | `/api/users/{name}/recipes`        | Optional  | Public profile — public recipes only |

## Running it with Docker (easiest)

Everything — MySQL, the Spring Boot API, and the React app served via Nginx — runs as three containers wired together with `docker-compose`. This is the fastest way to get the whole stack up, and it's also what you'd point to on your CV as a "just `docker compose up`" project.

**Prerequisite:** Docker Desktop (or Docker Engine + Compose) installed and running.

### 1. Configure secrets
```bash
cp .env.example .env
```
Open `.env` and set a real `MYSQL_ROOT_PASSWORD` and a long random `APP_JWT_SECRET`. `docker-compose.yml` reads this file automatically — don't commit it (it's already in `.gitignore`).

### 2. Build and start everything
```bash
docker compose up --build
```
First run builds three images:
- `mysql` — official MySQL 8 image, data persisted in a named volume (`mysql_data`)
- `backend` — multi-stage build: Maven compiles the jar, then it runs on a slim JRE image
- `frontend` — multi-stage build: `npm run build` produces the static React bundle, then Nginx serves it and proxies `/api/**` and `/uploads/**` through to the backend container

The backend waits for MySQL's healthcheck before starting, so tables get created automatically via Hibernate on first boot.

### 3. Open the app
- Frontend: **http://localhost:5173**
- Backend API directly (e.g. for Postman): **http://localhost:8080**

### 4. Stop / clean up
```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers AND wipe the mysql/uploads volumes
```

### How the pieces talk to each other
```
Browser
  → http://localhost:5173  (frontend container, Nginx)
      → /            → serves the built React app
      → /api/**      → proxied to http://backend:8080/api/**   (Docker internal DNS)
      → /uploads/**  → proxied to http://backend:8080/uploads/**

backend container
  → connects to MySQL at jdbc:mysql://mysql:3306/recipevault   (service name, not localhost)
  → uploaded recipe images are written to /app/uploads inside the container,
    which is mounted to the "uploads_data" named volume so they survive restarts
```

Notice the backend's `application.properties` values (datasource URL/credentials, JWT secret, CORS origins, upload dir) are all `${ENV_VAR:default}` placeholders — `docker-compose.yml` overrides them with container-appropriate values (e.g. host `mysql` instead of `localhost`) without you touching the properties file at all.

### Rebuilding after code changes
```bash
docker compose up --build backend    # just the backend
docker compose up --build frontend   # just the frontend
```

### Useful commands
```bash
docker compose logs -f backend    # tail backend logs
docker compose ps                 # see running containers
docker compose exec mysql mysql -uroot -p recipevault   # open a MySQL shell
```

---

## Running it locally (without Docker)

### 1. Database
```sql
-- MySQL must be running locally on 3306
CREATE DATABASE recipevault;
```
Or just start the backend — `spring.jpa.hibernate.ddl-auto=update` will create the tables for you.

Update `backend/src/main/resources/application.properties` with your MySQL username/password.

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
API runs on `http://localhost:8080`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173` (Vite dev server proxies `/api` and `/uploads` to the backend).

### 4. Try it
1. Register an account.
2. Create a recipe — try both Public and Private visibility.
3. Log out (or open an incognito window) and search for it: the private one won't show up.
4. Log back in and search again: now it does.

## Notes / next steps

- **Passwords** are hashed with BCrypt (`spring-security-crypto`), never stored in plaintext.
- **JWT** is stateless — no server-side session, `Authorization: Bearer <token>` on every authenticated request.
- **Image storage** currently writes to local disk under `uploads/recipe-images` and is served from `/uploads/**`. `FileStorageService` is the only class that would need to change to swap in Cloudinary or S3.
- Ideas for extending this further: pagination controls in the UI, recipe ratings/comments, follow other users, unit/integration tests (JUnit + MockMvc / Testcontainers), Dockerize the whole stack, deploy backend to Render/Railway and frontend to Vercel/Netlify for a live demo link on your CV.
