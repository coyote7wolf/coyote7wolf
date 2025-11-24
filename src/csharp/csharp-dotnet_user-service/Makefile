# Simple Makefile for .NET 9 Web API + Tests
# Usage: make [target]

DOTNET ?= dotnet
PROJECT := src/WebApi/WebApi.csproj
TEST_PROJECT := tests/WebApi.Tests/WebApi.Tests.csproj
PORT ?= 5088
COVERAGE_OUTPUT := coverage
COVERAGE_FORMAT := opencover

.PHONY: help build restore run run-port test coverage coverage-report clean

help:
	@echo "Available targets:"
	@echo "  restore           - Restore NuGet packages"
	@echo "  build             - Build solution"
	@echo "  run               - Run Web API (default port from launchSettings or Kestrel)"
	@echo "  run-port          - Run Web API on custom PORT (e.g. make run-port PORT=5000)"
	@echo "  test              - Run all tests"
	@echo "  coverage          - Run tests with coverage (opencover)"
	@echo "  coverage-report   - Generate HTML report (requires reportgenerator)"
	@echo "  clean             - Clean build artifacts"

restore:
	$(DOTNET) restore

build: restore
	$(DOTNET) build --no-restore

run: build
	$(DOTNET) run --project $(PROJECT)

run-port: build
	ASPNETCORE_URLS=http://localhost:$(PORT) $(DOTNET) run --project $(PROJECT)

test: build
	$(DOTNET) test --no-build

coverage: build
	$(DOTNET) test $(TEST_PROJECT) -p:CollectCoverage=true -p:CoverletOutputFormat=$(COVERAGE_FORMAT) -p:CoverletOutput=$(COVERAGE_OUTPUT)/

coverage-report: coverage
	@command -v reportgenerator >/dev/null 2>&1 || { echo "Install reportgenerator: dotnet tool install -g dotnet-reportgenerator-globaltool"; exit 1; }
	reportgenerator -reports:$(COVERAGE_OUTPUT)/**/coverage.$(COVERAGE_FORMAT).xml -targetdir:$(COVERAGE_OUTPUT)/report
	@echo "Open $(COVERAGE_OUTPUT)/report/index.html"

clean:
	$(DOTNET) clean
	rm -rf $(COVERAGE_OUTPUT)
