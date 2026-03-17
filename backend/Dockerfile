# Build stage
FROM gradle:jdk17 AS build
WORKDIR /app

# 현재 디렉토리(backend)의 내용을 /app으로 복사
COPY . .

# 만약 gradlew가 복사된 위치를 확인하고 싶다면 아래 주석을 풀고 잠시 테스트해 볼 수 있습니다.
# RUN ls -la

# 파일 권한 부여 및 빌드 (경로를 명확히 지정하거나 WORKDIR을 변경)
RUN chmod +x gradlew
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드 스테이지에서 생성된 jar 파일을 복사
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]