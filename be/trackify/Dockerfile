# ================================
# Stage 1: Build
# ================================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml trước để cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ================================
# Stage 2: Runtime
# ================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Cài Chromium + ChromeDriver cho Selenium
RUN apt-get update && apt-get install -y \
  chromium-browser \
  chromium-chromedriver \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libnspr4 \
  libnss3 \
  libxss1 \
  xdg-utils \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# WebDriverManager sẽ tìm Chrome tại đây
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMEDRIVER_PATH=/usr/lib/chromium-browser/chromedriver

# Copy jar từ stage build
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dwebdriver.chrome.driver=/usr/lib/chromium-browser/chromedriver", \
  "-jar", "app.jar"]