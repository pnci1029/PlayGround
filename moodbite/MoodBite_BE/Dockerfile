# Spring Boot Kotlin 백엔드 Dockerfile
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Gradle 래퍼와 빌드 스크립트 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# 소스 코드 복사
COPY src src

# 빌드 권한 설정 및 빌드 실행
RUN chmod +x ./gradlew
RUN ./gradlew bootJar -x test --no-daemon

# 빌드된 JAR 파일 위치
RUN mv build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8081

# 애플리케이션 실행
CMD ["java", "-jar", "app.jar"]