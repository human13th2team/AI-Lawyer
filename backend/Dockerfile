# Build stage
FROM gradle:jdk17 AS build
WORKDIR /app
COPY . .

# 👉 [추가된 부분] gradlew 파일에 실행 권한 부여
RUN chmod +x ./gradlew

# Gradle 빌드 실행 (테스트 제외하여 빌드 속도 향상)
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드 스테이지에서 생성된 jar 파일을 복사
COPY --from=build /app/build/libs/*.jar app.jar

# Koyeb 및 Spring Boot 기본 포트
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]