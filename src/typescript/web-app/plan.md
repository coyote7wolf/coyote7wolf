# syncCoreAI-web-app 開發計畫（Next.js + Tailwind + Redux + Shared SDK + WebSocket/CRDT/AI）

本文件描述 `syncCoreAI-web-app` 之分階段開發順序、目錄與核心技術、資料與事件流、測試與品質保證策略。以漸進式交付、可觀測性與多人協作一致性為主。

## 特別新增：多模式啟動與靜態部署支援

- `pnpm run dev`：連接真實後端服務
- `pnpm run dev:mock-api`：本地 JSON Server 提供 API mock（適合完整行為測試）
- `pnpm run dev:mock-data`：直接在前端使用靜態假資料（適合純 UI 開發與靜態部署）

## 集中管理

| 模組                              | 功能說明                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------- |
| **API Endpoint**                  | 統一管理後端路由（REST / GraphQL），確保前後端一致性與可維護性。                |
| **i18n**                          | 集中管理多語系詞條與格式，支援動態語系切換與自動偵測。                          |
| **Design Token (Theme)**          | 集中定義顏色、字體、間距、邊框等 UI 樣式基準，用於 Design System 與 Storybook。 |
| **Error Handling**                | 全域錯誤攔截與提示機制，統一處理 API、UI、邏輯錯誤。                            |
| **Routing**                       | 集中管理頁面導向與權限控制，支援動態路由與保護頁面（Protected Route）。         |
| **Environment**                   | 集中管理環境變數與設定，區分 dev/staging/prod 等執行環境。                      |
| **Auth Store**                    | 管理登入狀態、Session、Token 生命週期與自動刷新。                               |
| **Logger**                        | 統一管理日誌格式與層級（info/warn/error/debug），支援遠端上報。                 |
| **Request Wrapper (Axios/Fetch)** | 封裝 HTTP 請求層，統一攔截 request/response，加上 Token、自動刷新與錯誤提示。   |
| **Feature Flags / App Config**    | 控制功能開關與版本差異（A/B 測試、Beta 功能、實驗配置）。                       |
| **Form Validation Schema**        | 集中定義表單驗證規則（Yup/Zod），避免重複定義。                                 |
| **Constants / Enums**             | 定義全域常數、狀態枚舉、錯誤代碼與系統代號。                                    |
| **Storage Helper**                | 封裝 localStorage/sessionStorage 操作，統一序列化與命名空間。                   |
| **Analytics / Tracking**          | 集中管理使用者行為追蹤與事件紀錄（GA、Mixpanel、Segment）。                     |

---

## 1. 多模式啟動策略與靜態部署考量

### 1.1 啟動模式比較

| 模式               | 指令                     | 後端依賴                  | WebSocket        | 適用場景               | 靜態部署相容 |
| ------------------ | ------------------------ | ------------------------- | ---------------- | ---------------------- | ------------ |
| **開發模式**       | `pnpm run dev`           | 需要真實 Gateway + 各服務 | 真實 WS 連線     | 完整功能開發測試       | ❌           |
| **Mock API 模式**  | `pnpm run dev:mock-api`  | 本地 JSON Server          | Mock WS Server   | 後端未就緒時的整合測試 | ⚠️ 需要 SSG  |
| **Mock Data 模式** | `pnpm run dev:mock-data` | 無（純前端假資料）        | Mock WS 事件循環 | UI/UX 迭代，作品展示   | ✅ 完全相容  |

### 1.2 靜態部署策略

**問題：** Next.js SSR/API Routes 無法部署到純靜態 CDN（GitHub Pages, Netlify Static, Vercel Static）

**解法：**

1. **Mock Data 模式 + SSG**：所有頁面用 `getStaticProps` 預渲染，假資料在 build time 注入
2. **Client 端動態載入**：Runtime 根據環境變數決定資料來源（API vs 本地 JSON）
3. **Service Worker**：攔截 fetch 請求，回傳預設的 JSON responses

### 1.3 實作架構

```text
src/
  services/
    api/
      httpClient.ts           # 統一 fetch wrapper
      mockAdapter.ts          # Mock 模式下的 adapter
    websocket/
      wsClient.ts             # 真實 WebSocket client
      mockWsClient.ts         # Mock WebSocket 事件產生器
  mocks/
    data/                     # 靜態 JSON 檔案
      users.json
      documents.json
      aiSuggestions.json
    scenarios/                # 不同情境組合
      default.ts
      conflict.ts
      offline.ts
    servers/                  # JSON Server 設定（mock-api 模式用）
      routes.json
      server.js
  config/
    environment.ts            # 環境模式判斷與設定
```

### 1.4 package.json 腳本設計

```json
{
  "scripts": {
    "dev": "cross-env MODE=development next dev",
    "dev:mock-api": "concurrently \"npm run mock-server\" \"cross-env MODE=mock-api next dev\"",
    "dev:mock-data": "cross-env MODE=mock-data next dev",
    "mock-server": "json-server --watch src/mocks/data --routes src/mocks/servers/routes.json --port 3100",
    "build": "cross-env MODE=production next build",
    "build:static": "cross-env MODE=mock-data next build && next export",
    "start": "next start"
  }
}
```

### 1.5 環境變數與模式判斷

```typescript
// src/config/environment.ts
export type AppMode = "development" | "mock-api" | "mock-data" | "production";

export const APP_MODE: AppMode = (process.env.MODE as AppMode) || "development";

export const CONFIG = {
  development: {
    apiBase: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3100",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3302",
    useMockData: false,
    enableWebSocket: true,
  },
  "mock-api": {
    apiBase: "http://localhost:3100", // JSON Server
    wsUrl: "ws://localhost:3333", // Mock WS Server
    useMockData: false,
    enableWebSocket: true,
  },
  "mock-data": {
    apiBase: "", // 不使用真實 API
    wsUrl: "", // 不使用真實 WebSocket
    useMockData: true,
    enableWebSocket: false, // 改用本地事件循環
  },
  production: {
    apiBase: process.env.NEXT_PUBLIC_API_BASE || "https://api.synccoreai.com",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "wss://ws.synccoreai.com",
    useMockData: false,
    enableWebSocket: true,
  },
}[APP_MODE];
```

---

## 2. 分階段開發順序總覽

| 序  | 階段                     | 目標                                 | 主要產出                                                | 依賴  |
| --- | ------------------------ | ------------------------------------ | ------------------------------------------------------- | ----- |
| 1   | 初始化骨架               | 建立 Next.js + TS 基礎配置           | 專案結構 / ESLint / Prettier / env                      | 無    |
| 2   | 多模式啟動整合           | dev/mock-api/mock-data 三模式實作    | 啟動腳本 + 環境判斷 + 靜態部署配置                      | 1     |
| 3   | Design System / Tailwind | 導入共用 UI 與主題                   | tailwind.config / DS provider                           | 1     |
| 4   | 狀態模型定義             | Redux store 與 slices                | `auth/document/sync/presence/offlineQueue/aiSuggestion` | 1     |
| 5   | Auth & Gateway Flow      | 登入 / Token 刷新 / 受保護路由       | Auth hooks / API client（支援 mock 切換）               | 4,2   |
| 6   | WebSocket Presence       | 連線管理 / 游標 / 上線狀態           | WS handler + presence slice（含 mock 版本）             | 4,5,2 |
| 7   | 文檔 CRUD UI             | 文件列表 / 詳情 / 編輯 / 版本歷史    | Pages + Document slice 擴充                             | 5     |
| 8   | CRDT / Conflict UI       | Delta merge / 衝突顯示               | CRDT util + Conflict panel                              | 6,7   |
| 9   | 離線暫存與重播           | IndexedDB / Queue / 重播策略         | Offline manager + slice                                 | 7,8   |
| 10  | Sync Flow 整合           | 編輯 →delta→sync→ 版本更新閉環       | End-to-end flow glue                                    | 6–9   |
| 11  | 通知系統                 | 推播 / Toast / 側邊通知中心          | Notification hub                                        | 6,7   |
| 12  | AI Suggestion 面板       | 顯示/套用 AI 建議                    | Suggestion panel + slice                                | 10,11 |
| 13  | 儀表指標                 | Latency / Conflict Rate / Throughput | Metrics HUD / hooks                                     | 10    |
| 14  | 單元測試                 | Reducer / CRDT / Hooks 測試          | Jest + RTL 環境（含三種模式測試）                       | 4–10  |
| 15  | Smoke & Coverage CI      | 基本端到端頁面載入流程               | CI 腳本 / coverage gate                                 | 14    |
| 16  | 性能優化                 | Split / Memo / 虛擬列表              | Perf 分析報告                                           | 7–15  |
| 17  | 安全強化                 | XSS / CSRF / JWT Flow                | 安全中介層 / headers                                    | 5,7   |
| 18  | SEO/SSR/SSG 配置         | SEO / 首屏效能                       | Data fetching strategy（靜態模式 getStaticProps）       | 1,5,7 |
| 19  | 國際化與可用性           | i18n / a11y                          | i18n config / a11y checks                               | 3,7   |
| 20  | 部署檢查與環境設定       | Build / Docker / Env gating          | 三模式 build output / manifest                          | 15–19 |
| 21  | README 文檔              | Run/Test/Verify/架構圖               | 完整 README                                             | 全部  |

---

## 3. 核心目標分層

1. **一致性**：CRDT + Sync + Conflict 事件驅動，使前端狀態最終一致
2. **低延遲**：WebSocket + Redis Pub/Sub 通路下前端操作 <200ms 回饋
3. **可恢復**：Offline Queue + Delta Replay 確保斷線/離線操作不遺失
4. **智能輔助**：AI Suggestion（摘要/翻譯/修正）快速套用至編輯內容
5. **可觀測**：Latency/Conflict 指標即時顯示，協助優化與排障
6. **多模式部署**：支援開發/展示/靜態部署三種模式，滿足不同場景需求

---

## 4. 目錄結構（更新版）

```text
src/
  app/               # Next.js App Router (layout.tsx, page.tsx, error.tsx)
  pages/             # 若混合使用舊 Pages Router（可選）
  components/        # Pure UI 元件（無業務邏輯）
  features/          # 功能模組（跨頁整合）
    auth/
    document/
    sync/
    presence/
    offline/
    ai/
    notification/
    metrics/
  state/
    slices/          # Redux slice 定義
    store.ts         # configureStore + middleware
  services/
    api/             # Gateway API client / fetch wrapper
      httpClient.ts           # 統一 fetch wrapper
      mockAdapter.ts          # Mock 模式下的 adapter
    websocket/       # WS 連線管理、事件訂閱
      wsClient.ts             # 真實 WebSocket client
      mockWsClient.ts         # Mock WebSocket 事件產生器
    crdt/            # CRDT merge/transform utilities
    offline/         # IndexedDB/localStorage 操作封裝
  hooks/             # Reusable hooks（usePresence, useLatencyChart）
  utils/             # 工具方法（節流、防抖、深比較、序列化）
  styles/            # 全域樣式、Tailwind directives
  config/            # 環境設定、常數、feature flags
    environment.ts            # 環境模式判斷與設定
  mocks/             # Mock 資料與設定
    data/                     # 靜態 JSON 檔案
      users.json
      documents.json
      aiSuggestions.json
    scenarios/                # 不同情境組合
      default.ts
      conflict.ts
      offline.ts
    servers/                  # JSON Server 設定（mock-api 模式用）
      routes.json
      server.js
  tests/             # 單元測試與 utils mock
public/              # 靜態資源
```

---

## 5. Redux Slices 初始設計

| Slice        | 主要 state                                             | 說明                   | 事件觸發來源                                 |
| ------------ | ------------------------------------------------------ | ---------------------- | -------------------------------------------- |
| auth         | token, refreshDue, roles, userId                       | 登入與權限             | `/auth/login`, `/auth/refresh`               |
| user         | profile, presenceMeta                                  | 使用者偏好/個人狀態    | `/user/me`, `presence.update`                |
| document     | activeDoc, versions[], editingState, pendingLocalOps[] | 文件內容與版本資料     | `document.delta.applied`, `document.updated` |
| sync         | lastAppliedVersion, pendingDeltas[], latencySamples[]  | 同步閉環與延遲統計     | `document.updated`, delta 發送前後時間戳     |
| presence     | peers[], cursors{userId→pos}, connectionStatus         | 多人游標與連線狀態     | `presence.update`, WS reconnect              |
| offlineQueue | queuedOps[], replayState                               | 暫存離線操作與重播進度 | Network online event, replay 排程            |
| aiSuggestion | suggestions[], applyingState                           | AI 建議清單與套用狀態  | `ai.suggestion.generated`, apply action      |
| notification | items[], unreadCount                                   | 系統/文件/AI 通知集合  | `notification.push`                          |
| metrics      | conflictRate, avgLatency, syncThroughput               | UI 即時指標            | 聚合自其他 slices 或 WS 樣本                 |

**中介層（middleware）：**

- `crdtMiddleware`：攔截文件編輯 action → 產生 delta → 送出 WebSocket/API
- `offlineMiddleware`：若離線 → 推入 offlineQueue；上線後 flush
- `metricsMiddleware`：記錄時間戳與事件類型 → 更新 latency/conflict rate
- `mockMiddleware`：在 mock-data 模式下攔截 API 請求，回傳本地資料

---

## 6. 事件與資料流（簡述）

```text
User Edit → dispatch(editLocal) → crdtMiddleware 產生 delta → send(delta)
  → WS ack / 或 API 回傳版本 → dispatch(applyRemoteDelta)
     → documentSlice 更新 versions / content
     → syncSlice 更新 lastAppliedVersion / latency statistic
     → presenceSlice（若游標位置改變）send(presence.update)
     → aiSuggestionSlice（若觸發 AI）等待 `ai.suggestion.generated`
```

**WebSocket 訂閱事件：**

- `document.delta.applied`：遠端他人編輯 delta
- `conflict.resolved`：CRDT/OT 合併完成
- `presence.update`：線上使用者及游標移動
- `ai.suggestion.generated`：AI 提供新建議
- `notification.push`：系統通知（衝突/版本/AI）

**Mock 模式事件模擬：**

- mock-data 模式：使用 `setInterval` 模擬定期事件推送
- mock-api 模式：JSON Server + 簡單 WebSocket server

---

## 7. CRDT / 衝突處理 UI 要點

1. 編輯區採本地暫存 + remote patch 合併（避免頻繁 re-render）
2. 衝突狀態顯示：`MERGING` / `RESOLVED` / `MANUAL_REQUIRED`
3. 手動合併介面：列出 diff chunk，允許選擇本地或遠端版本；提供「全部採遠端 / 全部保留本地」快速操作
4. Merge Performance：對大型文件分段（chunk）與 idle callback 套用

---

## 8. 離線與重播策略

- 監聽 `navigator.onLine` 與 WS reconnect 事件
- IndexedDB 儲存 `queuedOps`（含 time、docId、opType、payload）
- 重播策略：排序後批次送出（節流：每 100ms 最多 N 個），失敗採指數退避
- 衝突偵測：若版本號差距過大 → 先拉取最新 document snapshot 再重播

---

## 9. AI Suggestion 面板

- 事件來源：`document.updated` 觸發後端 AI Flow → 推播 `ai.suggestion.generated`
- 顯示內容：建議類型（summary/translation/refactor/conflict-explain）、權重/置信度
- 可套用：點選後生成對 delta 的高階操作（可能為多段 patch）
- 可回饋：接受/拒絕 → 回傳 feedback 供後端調整模型記憶

---

## 10. Metrics 指標（HUD）

- Latency：delta 發送 → 版本更新完成的 ms；滑動窗口平均
- Conflict Rate：一定時間內 `conflict.resolved` 次數 / 編輯次數
- Sync Throughput：每秒成功套用 remote delta 個數
- 呈現方式：右下角浮窗 + 展開詳情（圖表可懶載入）

---

## 11. 測試策略

| 類型          | 範圍                                              | 工具              | 範例                    |
| ------------- | ------------------------------------------------- | ----------------- | ----------------------- |
| 單元          | reducers / CRDT utils / middleware                | Jest              | `documentSlice.test.ts` |
| 組件          | Editor / SuggestionPanel / PresenceAvatars        | RTL               | `Editor.spec.tsx`       |
| Hook          | usePresence / useLatencyChart                     | Jest + RTL        | `usePresence.test.ts`   |
| Smoke         | 登入 → 開文件 → 編輯 → 收到建議                   | Jest (簡化端對端) | `smoke/flow.spec.ts`    |
| Coverage Gate | statements 80 / branches 70 / lines 80 / funcs 75 | CI                | `npm run test:coverage` |

**Mock 策略：**

- WebSocket：抽象成 adapter，測試時以事件排程陣列模擬
- IndexedDB：使用 in-memory stub
- API：依據 APP_MODE 自動切換真實/mock
- 三模式測試：確保每種啟動模式都有對應測試覆蓋

---

## 12. 性能優化重點（第 16 階段）

- Route-level Code Splitting + dynamic import（AI 面板懶載入）
- 虛擬列表：文件版本歷史、建議列表（大量資料時）
- CRDT 合併節流：Idle callback + requestAnimationFrame 分批 patch
- 避免不必要渲染：Selector memo + React.memo + useCallback/useMemo
- WS 訊息批次：短時間多筆 delta → 合併集合後再 dispatch

---

## 13. 安全與風險控制

- XSS：輸入內容 sanitize（白名單 tag）
- JWT Refresh：主動與被動刷新（過期前 n 秒觸發）
- CSRF：若有跨站表單互動則加 token；主要為 API Bearer 模式可簡化
- Header：`Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`
- 敏感資訊：不在前端保留使用者權限細節 beyond 當前 session scope

---

## 14. SSR / SSG 策略

- 需權限頁：`getServerSideProps` 確保初次渲染權限正確
- 公開說明 / Landing：SSG + Revalidate（ISR）提升 SEO
- 混合：文件編輯頁可 SSR 初始 metadata + 客戶端接管 WebSocket
- **靜態部署模式**：mock-data 下全面使用 `getStaticProps`，確保可部署到 CDN

---

## 15. i18n / 可用性

- 使用 `next-intl` 或同級方案：名稱空間拆分（auth, document, ai, metrics）
- 快捷鍵：Ctrl+K 呼叫 AI Suggestion 面板；Esc 關閉
- ARIA：游標/Presence avatar 使用 `aria-label=userId`；通知面板有焦點循環

---

## 16. 部署前檢查（第 20 階段）

- `npm run build`, `npm run build:static` 分析 bundle（webpack analyzer 或 Next trace）
- ENV 列表：`MODE`, `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_WS_URL`, `FEATURE_FLAGS`
- Docker（選）：使用 multi-stage build（依需求）
- Source Map：上傳到 Sentry/監控平台
- **靜態部署檢查**：確認 mock-data 模式下無 SSR 依賴

---

## 17. README 文檔（第 21 階段將補齊）

**內容提要：**

1. How to Run / Dev / Build（三種模式說明）
2. How to Test / Coverage / Smoke（含 mock 測試）
3. How to Verify（情境：編輯同步、AI 建議套用、離線重播）
4. 架構與事件流圖（簡版 vs 詳版）
5. 目錄結構與擴充指引（如何新增新 slice / 新事件）
6. 安全與性能最佳實務摘要
7. **部署指南**：開發部署 vs 靜態部署步驟

---

## 18. 開發中進度追蹤（對應 Todo）

- [ ] 階段 1 初始化骨架
- [ ] 階段 2 多模式啟動整合
- [ ] 階段 3 Design System / Tailwind
- [ ] 階段 4 狀態模型定義
- [ ] 階段 5 Auth & Gateway Flow
- [ ] 階段 6 WebSocket Presence
- [ ] 階段 7 文檔 CRUD UI
- [ ] 階段 8 CRDT / Conflict UI
- [ ] 階段 9 離線暫存與重播
- [ ] 階段 10 Sync Flow 整合
- [ ] 階段 11 通知系統
- [ ] 階段 12 AI Suggestion 面板
- [ ] 階段 13 儀表指標
- [ ] 階段 14 單元測試
- [ ] 階段 15 Smoke & CI
- [ ] 階段 16 性能優化
- [ ] 階段 17 安全強化
- [ ] 階段 18 SEO/SSR/SSG
- [ ] 階段 19 i18n / a11y
- [ ] 階段 20 部署檢查
- [ ] 階段 21 README 文檔

---

## 19. 後續可考慮的附加改進（非當前必做）

- GraphQL 客戶端（若 Gateway 聚合 GraphQL）整合 codegen
- WebSocket 傳輸壓縮（大量 delta 時）與差異摘要
- Edge Runtime：特定 SSR 頁面放至 Vercel Edge（低延遲）
- PWA 支援：安裝/離線快取靜態資源
- Real User Monitoring：LCP/FID/CLS 指標上報
- **進階 Mock 功能**：網路延遲模擬、錯誤注入、壓力測試模式

---

若需立即展開某階段實作（例如初始化專案腳手架或撰寫多模式啟動範例），請在回覆中指名階段編號。
