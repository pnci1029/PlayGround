# Spring Boot Kotlin 백엔드 Dockerfile
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Gradle 래퍼와 빌드 스크립트 먼저 복사 (캐싱 레이어)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Gradle 권한 설정
RUN chmod +x ./gradlew

# 의존성 다운로드 (소스 코드 변경과 무관하게 캐싱)
RUN ./gradlew dependencies --no-daemon || true

# 소스 코드 복사 (마지막에)
COPY src src

# 빌드 실행 (의존성은 이미 캐싱됨)
RUN ./gradlew bootJar -x test --no-daemon

# 빌드된 JAR 파일 위치
RUN mv build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8081

# 애플리케이션 실행
CMD ["java", "-jar", "app.jar"]