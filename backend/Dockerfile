# 1단계: 빌드 (Gradle 8.x + JDK 17)
FROM gradle:8.5-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
# -x test를 통해 빌드 시간을 단축하고 메모리 사용량을 줄입니다.
RUN gradle build -x test --no-daemon

# 2단계: 실행 (JRE 17)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# build/libs 폴더에서 plain이 붙지 않은 실행 가능한 jar만 복사
COPY --from=build /home/gradle/src/build/libs/*[!plain].jar app.jar

# Render는 512MB~1GB RAM을 제공하므로 JVM 메모리를 명시적으로 제한해야 안정적입니다.
# LangChain4j와 PDFBox가 메모리를 꽤 사용하므로 Xmx 설정을 꼭 넣어주세요.
ENV JAVA_OPTS="-Xms256m -Xmx400m"

EXPOSE 8080

# 환경변수 PORT를 Spring Boot의 포트로 연결
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]