# Build from the repository root, for example:
# docker build --build-arg MODULE=auth -f backend/Dockerfile .
FROM maven:3.9-eclipse-temurin-21 AS build

ARG MODULE
WORKDIR /workspace
COPY backend/${MODULE}/pom.xml ./pom.xml
COPY backend/${MODULE}/src ./src
RUN mvn -B -DskipTests package
RUN artifact=$(find /workspace/target -maxdepth 1 -type f \( -name '*.war' -o -name '*.jar' \) | head -n 1) \
    && test -n "$artifact" \
    && cp "$artifact" /workspace/app.jar

FROM eclipse-temurin:21-jre
ARG MODULE
WORKDIR /app
COPY --from=build /workspace/app.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
