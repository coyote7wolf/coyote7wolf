# ==============================================
# 專案 Makefile  (使用 Gradle Wrapper)
# 使用方式：在專案根目錄直接輸入 `make <目標>`
# 例如：`make run-mock` 啟動 Mock Profile 服務
# ==============================================

# 允許在命令列覆寫，例如: make run PORT=9090
PORT ?= 8083
PROFILE ?= default
JAR_FILE := build/libs/kotlin-spring-boot_skeleton-0.0.1-SNAPSHOT.jar
GRADLE := ./gradlew

.PHONY: help build clean test coverage lint format detekt run run-mock run-mock-bg jar run-jar run-jar-mock run-jar-mock-bg verify ci health health-wait coverage-badge stop pid

help: ## 顯示可用目標說明
	@echo "可用目標："
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' Makefile | sed 's/:.*## /\t - /'

clean: ## 清理建置輸出
	$(GRADLE) clean

build: ## 編譯 + 單元測試 + 產出報告 (等同於 check)
	$(GRADLE) clean build

jar: ## 只建置可執行 JAR
	$(GRADLE) bootJar

run: ## 使用預設 Profile 啟動開發 (可能載入 devtools)
	$(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=$(PROFILE)'

run-mock: ## 使用 mock Profile 前景啟動 (記憶體內部實作)
	$(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=mock'

run-mock-bg: ## 背景啟動 mock Profile (輸出 -> run.log, PID: app.pid)
	@echo "背景啟動 bootRun (mock) ..."
	@nohup $(GRADLE) bootRun --args='--server.port=$(PORT) --spring.profiles.active=mock' > run.log 2>&1 & echo $$! > app.pid
	@echo "PID 儲存於 app.pid，日志檔：run.log"

run-jar: jar ## 以 JAR 啟動 (PROFILE=$(PROFILE))
	java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=$(PROFILE)

run-jar-mock: jar ## 以 JAR 前景啟動 mock Profile
	java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=mock

run-jar-mock-bg: jar ## 以 JAR 背景啟動 mock Profile (log: run.log, PID: app.pid)
	@echo "背景啟動 jar (mock) ..."
	@nohup java -jar $(JAR_FILE) --server.port=$(PORT) --spring.profiles.active=mock > run.log 2>&1 & echo $$! > app.pid
	@echo "PID 儲存於 app.pid，日志檔：run.log"

test: ## 執行單元測試
	$(GRADLE) test

coverage: test ## 產出 Jacoco 覆蓋率報告 (build/reports/jacoco/test)
	@echo "Jacoco 報告已產出：build/reports/jacoco/test/index.html"

lint: ## 執行 ktlint (檢查)
	$(GRADLE) ktlintCheck

format: ## 嘗試自動格式化 Kotlin 程式碼
	$(GRADLE) ktlintFormat

detekt: ## 執行 detekt 靜態分析
	$(GRADLE) detekt

verify: ## 快速驗證：格式 + 靜態分析 + 測試 + 覆蓋率閾值
	$(GRADLE) ktlintCheck detekt test jacocoCoverageVerification

ci: ## CI 流程建議：乾淨建置 + 驗證
	$(GRADLE) clean ktlintCheck detekt test jacocoCoverageVerification bootJar

health: ## 呼叫 /actuator/health 顯示狀態 (需先啟動服務)
	@echo "檢查健康狀態 http://localhost:$(PORT)/actuator/health"
	@curl -s -o /tmp/health.json -w '%{http_code}\n' http://localhost:$(PORT)/actuator/health > /tmp/health.code || true
	@CODE=$$(cat /tmp/health.code); BODY=$$(cat /tmp/health.json); \
	 echo "HTTP 狀態碼: $$CODE"; \
	 echo "Body: $$BODY"; \
	 if [ "$$CODE" != "200" ]; then echo "⚠️ 服務健康檢查非 200，可能有未啟動的依賴 (例如 Redis/Rabbit/DB)。"; fi

stop: ## 停止背景啟動的應用 (使用 app.pid 或名稱匹配)
	@if [ -f app.pid ]; then \
	  PID=$$(cat app.pid); \
	  if kill -0 $$PID 2>/dev/null; then \
	    echo "終止 PID $$PID"; kill $$PID; else echo "PID $$PID 不存在"; fi; \
	  rm -f app.pid; \
	else \
	  echo "找不到 app.pid，改用名稱匹配嘗試停止"; pkill -f 'kotlin-spring-boot_skeleton' || true; \
	fi
	@echo "停止指令已執行"

pid: ## 顯示目前背景 PID (若存在)
	@if [ -f app.pid ]; then echo "背景 PID: $$(cat app.pid)"; else echo "無 app.pid"; fi

coverage-badge: test ## 產生 (或更新) coverage badge (使用 Jacoco 最終 LINE summary)
	@XML=build/reports/jacoco/test/jacocoTestReport.xml; \
	 if [ ! -f $$XML ]; then echo "未找到 $$XML"; exit 1; fi; \
	 last=$$(grep 'counter type="LINE"' $$XML | tail -n 1); \
	 missed=$$(echo $$last | sed -E 's/.*missed="([0-9]+)".*/\1/'); \
	 covered=$$(echo $$last | sed -E 's/.*covered="([0-9]+)".*/\1/'); \
	 if [ -z "$$covered" ] || [ -z "$$missed" ]; then echo "解析失敗: $$last"; exit 1; fi; \
	 total=$$((covered + missed)); pct=0; if [ $$total -gt 0 ]; then pct=$$((covered * 100 / total)); fi; \
	 mkdir -p badges; echo "{\"coverageLinePercent\": $$pct}" > badges/coverage.json; \
	 echo "行覆蓋率: $$pct% (covered=$$covered missed=$$missed total=$$total)"; \
	 echo "輸出: badges/coverage.json"

health-wait: ## 輪詢健康 (最多 30 秒)；成功返回 0，失敗返回 1
	@echo "輪詢健康檢查 http://localhost:$(PORT)/actuator/health (timeout 30s)"; \
	 for i in $$(seq 1 30); do \
	   CODE=$$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$(PORT)/actuator/health || true); \
	   if [ "$$CODE" = "200" ]; then echo "健康檢查成功 (i=$$i)"; exit 0; fi; \
	   sleep 1; \
	 done; echo "健康檢查逾時"; exit 1

# 範例：
# make run-mock PORT=9095
# make run PROFILE=mock
