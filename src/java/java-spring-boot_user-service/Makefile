# Makefile for java-spring-boot_user-service
# Each target has a short description after '##' for help aggregation.

MVNW=./mvnw
APP_PORT?=8080
PROFILE?=default
JACOCO_REPORT=target/site/jacoco/index.html
PID_FILE=.app.pid
CURL_BIN?=curl
JQ?=jq

# Internal function to find running java process (simplistic: matching jar/main class)
JAVA_CMD?=JavaSpringBootUserserviceApplication

.PHONY: help run run-dev stop test coverage format verify clean curl-create curl-get curl-list curl-update curl-delete curl-health curl-openapi

help: ## Show available make targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | sed -E 's/:.*##/: /' | sort

run: ## Run application with default profile (PROFILE=default)
	$(MVNW) spring-boot:run -Dspring-boot.run.profiles=$(PROFILE)

run-dev: ## Run application with dev profile and expose metrics (override via PROFILE=)
	$(MVNW) spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.jvmArguments="-Dmanagement.endpoints.web.exposure.include=health,info,metrics"

stop: ## Attempt to stop running app (best-effort by port or main class)
	@if lsof -ti tcp:$(APP_PORT) >/dev/null 2>&1; then \
		PID=$$(lsof -ti tcp:$(APP_PORT)); echo "Killing process on port $(APP_PORT): $$PID"; kill $$PID; \
	else \
		PID=$$(ps aux | grep $(JAVA_CMD) | grep -v grep | awk '{print $$2}'); \
		[ -n "$$PID" ] && echo "Killing process by name $(JAVA_CMD): $$PID" && kill $$PID || echo "No running process found"; \
	fi

clean: ## Clean build artifacts
	$(MVNW) clean

format: ## Apply Spotless formatting
	$(MVNW) spotless:apply

test: ## Run unit tests
	$(MVNW) test

coverage: ## Run verify (tests + coverage) and open JaCoCo report (macOS)
	$(MVNW) -q verify && ( [ -f $(JACOCO_REPORT) ] && open $(JACOCO_REPORT) || echo "Report not found: $(JACOCO_REPORT)" )

verify: ## Format + test + coverage gate
	$(MVNW) clean verify

curl-create: ## Sample create user request
	@$(CURL_BIN) -i -X POST http://localhost:$(APP_PORT)/api/v1/users -H 'Content-Type: application/json' -d '{"email":"user1@example.com","displayName":"User One"}'

curl-get: ## Sample get user (requires ID env: ID=<uuid>)
	@test -n "$(ID)" || (echo 'Set ID=<uuid> make curl-get' && exit 1); \
	$(CURL_BIN) -s http://localhost:$(APP_PORT)/api/v1/users/$(ID) | $(JQ)

curl-list: ## List users
	@$(CURL_BIN) -s http://localhost:$(APP_PORT)/api/v1/users | $(JQ)

curl-update: ## Update user (requires ID env)
	@test -n "$(ID)" || (echo 'Set ID=<uuid> make curl-update' && exit 1); \
	$(CURL_BIN) -i -X PUT http://localhost:$(APP_PORT)/api/v1/users/$(ID) -H 'Content-Type: application/json' -d '{"email":"user1+new@example.com","displayName":"User One New"}'

curl-delete: ## Delete user (requires ID env)
	@test -n "$(ID)" || (echo 'Set ID=<uuid> make curl-delete' && exit 1); \
	$(CURL_BIN) -i -X DELETE http://localhost:$(APP_PORT)/api/v1/users/$(ID)

curl-health: ## Health endpoint
	@$(CURL_BIN) -s http://localhost:$(APP_PORT)/actuator/health | $(JQ)

curl-openapi: ## Fetch OpenAPI JSON info section
	@$(CURL_BIN) -s http://localhost:$(APP_PORT)/v3/api-docs | $(JQ) '.info'
