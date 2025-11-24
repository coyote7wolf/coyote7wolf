
# ==============================================
# Project Makefile (using Gradle Wrapper)
# Usage: Run `make <target>` in the project root directory
# Example: `make run-mock` to start the service with the mock profile
# ==============================================

# Allow override from command line, e.g.: make run PORT=9090
PORT ?= 8083
PROFILE ?= default
JAR_FILE := build/libs/kotlin-spring-boot_user-service-0.0.1-SNAPSHOT.jar
GRADLE := ./gradlew

.PHONY: help build clean test coverage lint format detekt run run-mock run-mock-bg jar run-jar run-jar-mock run-jar-mock-bg verify ci health health-wait coverage-badge stop pid

help: ## Show available targets and descriptions
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' Makefile | sed 's/:.*## /\t - /'

clean: ## Clean build outputs
	$(GRADLE) clean

build: ## Build, unit test, and generate reports (same as check)
	$(GRADLE) clean build

jar: ## Build executable JAR only
	$(GRADLE) bootJar

run: ## Start development with default profile (may load devtools)
	$(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=$(PROFILE)'

run-mock: ## Start with mock profile in foreground (in-memory implementation)
	$(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=mock'

run-mock-bg: ## Start mock profile in background (output -> run.log, PID: app.pid)
	@echo "Starting bootRun (mock) in background ..."
	@nohup $(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=mock' > run.log 2>&1 & echo $$! > app.pid
	@echo "PID saved to app.pid, log file: run.log"

run-jar: jar ## Start with JAR (PROFILE=$(PROFILE))
	java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=$(PROFILE)

run-jar-mock: jar ## Start JAR in foreground with mock profile
	java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=mock

run-jar-mock-bg: jar ## Start JAR with mock profile in background (log: run.log, PID: app.pid)
	@echo "Starting jar (mock) in background ..."
	@nohup java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=mock > run.log 2>&1 & echo $$! > app.pid
	@echo "PID saved to app.pid, log file: run.log"

test: ## Run unit tests
	$(GRADLE) test

coverage: test ## Generate Jacoco coverage report (build/reports/jacoco/test)
	@echo "Jacoco report generated: build/reports/jacoco/test/index.html"

lint: ## Run ktlint (check)
	$(GRADLE) ktlintCheck

format: ## Try to auto-format Kotlin code
	$(GRADLE) ktlintFormat

detekt: ## Run detekt static analysis
	$(GRADLE) detekt

verify: ## Quick verify: format + static analysis + test + coverage threshold
	$(GRADLE) ktlintCheck detekt test jacocoCoverageVerification

ci: ## CI flow suggestion: clean build + verify
	$(GRADLE) clean ktlintCheck detekt test jacocoCoverageVerification bootJar

health: ## Call /actuator/health to show status (service must be running)
	@echo "Checking health status http://localhost:$(PORT)/actuator/health"
	@curl -s -o /tmp/health.json -w '%{http_code}\n' http://localhost:$(PORT)/actuator/health > /tmp/health.code || true
	@CODE=$$(cat /tmp/health.code); BODY=$$(cat /tmp/health.json); \
	 echo "HTTP status code: $$CODE"; \
	 echo "Body: $$BODY"; \
	 if [ "$$CODE" != "200" ]; then echo "⚠️ Health check not 200, some dependencies may not be running (e.g. Redis/Rabbit/DB)."; fi

stop: ## Stop background application (using app.pid or name match)
		@if [ -f app.pid ]; then \
			PID=$$(cat app.pid); \
			if kill -0 $$PID 2>/dev/null; then \
				echo "Killing PID $$PID"; kill $$PID; else echo "PID $$PID does not exist"; fi; \
			rm -f app.pid; \
		else \
			echo "app.pid not found, try to stop by name match"; pkill -f 'kotlin-spring-boot_user-service' || true; \
		fi
		@echo "Stop command executed"

pid: ## Show current background PID (if exists)
	@if [ -f app.pid ]; then echo "Background PID: $$(cat app.pid)"; else echo "No app.pid"; fi

coverage-badge: test ## Generate (or update) coverage badge (using Jacoco final LINE summary)
	@XML=build/reports/jacoco/test/jacocoTestReport.xml; \
	 if [ ! -f $$XML ]; then echo "Not found: $$XML"; exit 1; fi; \
	 last=$$(grep 'counter type="LINE"' $$XML | tail -n 1); \
	 missed=$$(echo $$last | sed -E 's/.*missed="([0-9]+)".*/\1/'); \
	 covered=$$(echo $$last | sed -E 's/.*covered="([0-9]+)".*/\1/'); \
	 if [ -z "$$covered" ] || [ -z "$$missed" ]; then echo "Parse failed: $$last"; exit 1; fi; \
	 total=$$((covered + missed)); pct=0; if [ $$total -gt 0 ]; then pct=$$((covered * 100 / total)); fi; \
	 mkdir -p badges; echo "{\"coverageLinePercent\": $$pct}" > badges/coverage.json; \
	 echo "Line coverage: $$pct% (covered=$$covered missed=$$missed total=$$total)"; \
	 echo "Output: badges/coverage.json"

health-wait: ## Poll health (up to 30 seconds); returns 0 on success, 1 on failure
		@echo "Polling health check http://localhost:$(PORT)/actuator/health (timeout 30s)"; \
		 for i in $$(seq 1 30); do \
			 CODE=$$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$(PORT)/actuator/health || true); \
			 if [ "$$CODE" = "200" ]; then echo "Health check succeeded (i=$$i)"; exit 0; fi; \
			 sleep 1; \
		 done; echo "Health check timed out"; exit 1

# Example:
# make run-mock PORT=9095
# make run PROFILE=mock
