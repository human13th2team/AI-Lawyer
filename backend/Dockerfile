# Build stage
FROM gradle:jdk17 AS build
WORKDIR /app
COPY . .
# Gradle 빌드 실행 (테스트 제외하여 빌드 속도 향상)
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드 스테이지에서 생성된 jar 파일을 복사
# 프로젝트 버전 및 이름에 따라 jar 파일명이 달라질 수 있으므로 와일드카드 사용 권장
COPY --from=build /app/build/libs/*.jar app.jar

# Koyeb 및 Spring Boot 기본 포트
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
