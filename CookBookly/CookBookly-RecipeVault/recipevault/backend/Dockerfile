# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies separately from source for faster rebuilds
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=build /app/target/*.jar app.jar

# Where FileStorageService writes uploaded recipe images; mounted as a volume in compose.
VOLUME ["/app/uploads"]

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
