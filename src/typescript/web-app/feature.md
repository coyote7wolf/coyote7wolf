# 帳號密碼註冊流程

```
使用者
 │
 ▼
Browser
 │
 │ ① 開啟 web-frontend-app /register 頁面
 │   - 實作: 前端 Next.js
 │   - 範例: <Link href="/register">註冊</Link>
 │
 │ ② 輸入 email / password / 確認密碼
 │   - 實作: 前端 Next.js Form 元件
 │   - 範例: <input type="email" name="email" />
 │
 │ ③ 點擊「註冊」按鈕
 │       - 發送 POST /api-gateway/user/register
 │   - 實作: 前端 Next.js fetch
 │   - 範例:
 │       const res = await fetch('/api-gateway/user/register', {
 │           method: 'POST', body: JSON.stringify({email,password})
 │       })
 ▼
api-gateway
 │
 │ ④ 收到註冊請求
 │   - 實作: NestJS Controller
 │   - 範例: @Post('user/register') register(@Body() body) { ... }
 │
 │ ⑤ 轉送至 api-user
 │       URL: /api-user/register
 │   - 實作: NestJS HttpService
 │   - 範例: return this.httpService.post(`${USER_SERVICE}/register`, body)
 ▼
api-user
 │
 │ ⑥ 驗證資料格式
 │   - 實作: NestJS Service/DTO
 │   - 範例: if (!email.includes('@')) throw new BadRequestException()
 │
 │ ⑦ 檢查使用者是否已存在
 │   - 實作: NestJS Service + TypeORM / Prisma
 │   - 範例: const exists = await this.userRepo.findOne({email})
 │
 │ ⑧ 若不存在 → 建立新使用者資料
 │   - 實作: NestJS Service + DB
 │   - 範例: await this.userRepo.save({email, password: hashedPassword})
 │
 │ ⑨ 呼叫 mock-mailer 發送驗證 / 歡迎信
 │   - 實作: NestJS Service
 │   - 範例: await this.mailer.sendWelcome(email)
 ▼
mock-mailer
 │
 │ ⑩ 模擬寄信（log 或 console）
 │   - 實作: NestJS Service
 │   - 範例: console.log(`Send welcome email to ${email}`)
 ▼
api-user → api-gateway → Browser
 │
 │ ⑪ 回傳「註冊成功，請登入」訊息
 │   - 實作: NestJS Controller
 │   - 範例: return { ok: true, message: "註冊成功，請登入" }
 ▼
web-frontend-app
 │
 │ ⑫ 顯示訊息給使用者
 │   - 實作: Next.js Component / useState
 │   - 範例: setMessage(res.message)
 │
 │ ⑬ 提供導向 /login
 │   - 實作: Next.js Router
 │   - 範例: router.push('/login')
```

## 說明

前端 Next.js：處理表單、發送 API、顯示訊息、導向頁面。

api-gateway NestJS：統一入口，轉送請求至 microservice。

api-user NestJS：使用者 CRUD、資料驗證、呼叫 mock-mailer。

mock-mailer NestJS：模擬寄信（本地 log），不真正發送郵件。

## 細節

密碼加密 / 驗證

api-user 在儲存密碼前應 hash，例如 bcrypt。

登入時比對 hash。

表單驗證 & 錯誤回饋

前端除了簡單格式檢查，還應顯示錯誤訊息（例如 email 已存在）。

資料庫事務/唯一性保障

若同時多個註冊請求同時送到，應用資料庫 unique constraint，防止重複建立。

Email 驗證流程（選項）

如果要模擬完整流程，mock-mailer 可以回傳驗證連結，api-user 接收點擊後啟用帳號。

現在流程只是寄信，不包含「點擊驗證」步驟。

API Response 統一格式

回傳前端訊息時最好有 status / code / message，方便前端統一處理。

Rate limiting / Bot 防護（選項）

註冊容易被濫用，業界常加 captcha 或限制同 IP 註冊次數。

---

# Oauth註冊流程

```
使用者
 │
 ▼
Browser
 │
 │ ① 開啟 web-frontend-app /register 頁面
 │   - 實作: 前端 Next.js
 │   - 範例: <Link href="/register">註冊</Link>
 │
 │ ② 點選「使用 Google / OAuth 註冊」按鈕
 │   - 實作: 前端 Next.js Button
 │   - 範例: <button onClick={() => router.push('/api-gateway/auth/mock-oauth')}>使用 Google 註冊</button>
 │
 │ ③ 導向 api-gateway OAuth endpoint
 │       URL: /api-gateway/auth/mock-oauth
 │   - 實作: 前端 Next.js Router 導向
 │   - 範例: window.location.href = "/api-gateway/auth/mock-oauth"
 ▼
Browser 發送 GET /api-gateway/auth/mock-oauth
 │
 ▼
api-gateway
 │
 │ ④ 收到 /auth/mock-oauth 請求
 │   - 實作: NestJS Controller
 │   - 範例: @Get('auth/mock-oauth') redirectToAuth() { ... }
 │
 │ ⑤ 轉送至 api-auth
 │       URL: /api-auth/mock-oauth
 │   - 實作: NestJS HttpService
 │   - 範例: return this.httpService.get(`${AUTH_SERVICE}/mock-oauth`)
 ▼
api-auth (Mock OAuth Provider)
 │
 │ ⑥ 顯示 mock OAuth 授權頁面給使用者
 │       - 使用者看到「允許 / 拒絕」按鈕
 │   - 實作: NestJS Controller + template 或 JSON 模擬
 │   - 範例: return res.render('mock-oauth-page')
 │
 │ ⑦ 使用者操作：
 │       - 點擊「允許」 → 繼續流程
 │       - 點擊「拒絕」 → 返回 /register 或顯示錯誤
 │   - 實作: 前端 Browser
 │   - 範例: button click 導向 callback 或 error page
 │
 │ ⑧ 產生 fake authorization code 並 redirect 回 api-gateway callback
 │       URL: /api-gateway/auth/callback?code=fake123
 │   - 實作: NestJS Controller
 │   - 範例: res.redirect(`/api-gateway/auth/callback?code=${code}`)
 ▼
Browser
 │
 │ ⑨ 接收 redirect → 發送 GET /api-gateway/auth/callback?code=fake123
 │   - 實作: Browser 自動處理 redirect
 │   - 範例: URL bar 自動載入 callback
 ▼
api-gateway
 │
 │ ⑩ 收到 callback，解析 code
 │   - 實作: NestJS Controller
 │   - 範例: @Get('auth/callback') handleCallback(@Query('code') code) { ... }
 │
 │ ⑪ 轉送 code 至 api-auth 取得使用者資料
 │   - 實作: NestJS HttpService
 │   - 範例: return this.httpService.post(`${AUTH_SERVICE}/exchange-code`, { code })
 ▼
api-auth
 │
 │ ⑫ 查詢 api-user 是否存在此使用者
 │   - 實作: NestJS Service + HttpService
 │   - 範例: const user = await this.httpService.get(`${USER_SERVICE}/find?email=xxx`)
 │
 │ ⑬ 錯誤處理：
 │       - user not found → 建立新使用者
 │       - user 資料建立失敗 → 回傳錯誤訊息給前端
 ▼
api-user
 │
 │ ⑭ 若不存在 → 建立新使用者資料
 │   - 實作: NestJS Service + DB (Prisma / TypeORM)
 │   - 範例: await this.userRepo.save({ email, name, avatar })
 │
 │ ⑮ 若存在 → 使用既有資料
 │   - 實作: NestJS Service
 │   - 範例: return existingUser
 │
 │ ⑯ 回傳使用者資料給 api-auth
 ▼
api-auth
 │
 │ ⑰ 建立 Session（儲存 Redis / Memory）
 │   - 實作: NestJS Service
 │   - 範例: await this.sessionService.create(user.id)
 │
 │ ⑱ 回傳 Set-Cookie: sessionId
 │       - 設定 Cookie 屬性: httpOnly, SameSite, Secure (若 HTTPS)
 │       - Access-Control-Allow-Credentials: true
 │   - 實作: NestJS Controller
 │   - 範例: res.cookie("sessionId", sessionId, { httpOnly:true, sameSite:'lax' }).send({ ok: true, user })
 ▼
Browser
 │
 │ ⑲ 自動儲存 Cookie(sessionId)
 │   - 實作: Browser 自動處理
 │   - 範例: 無需程式碼，瀏覽器自動儲存
 │
 │ ⑳ 註冊完成，前端顯示「註冊成功」訊息
 │   - 實作: Next.js useState / Component
 │   - 範例: setMessage("註冊成功，已自動登入")
 │
 │ ㉑ 導向登入頁
 │   - 實作: Next.js Router
 │   - 範例: router.push("/login")
```

## 說明

錯誤處理

使用者拒絕授權 → 導回 /register

api-user 建立失敗 → api-auth 回傳錯誤

Cookie / 跨域

Set-Cookie 設置 httpOnly、SameSite、Secure

api-gateway 回傳 Access-Control-Allow-Credentials: true

前端 fetch / axios 需 { credentials: 'include' }

Mock 註明

Fake code 直接產生，不涉及真實 OAuth token

適合本地測試或 Demo

註冊成功提示

前端顯示「註冊成功」

可選自動登入或導向登入頁

---

建立 session：api-auth（登入成功後建立，存入 Redis 或 Memory）驗證 sessionId：api-gateway（每次請求時攔截驗證 sessionId 是否有效）刪除過期 session：Redis（自動根據 TTL 過期清除）

# 🔄 登入流程（帳號密碼 + Mock OAuth）

```
使用者
 │
 ▼
Browser（瀏覽器）
 │
 │ ① 開啟 web-frontend-app 頁面
 ▼
web-frontend-app（前端應用）
 │
 │ ② 導向 OAuth Provider（例如 Google）
 ▼
OAuth Provider（Google / GitHub / Internal SSO）
 │
 │ ③ 使用者同意授權 → 返回 Authorization Code
 ▼
web-frontend-app
 │
 │ ④ 將 Code 傳給 API Gateway 進行後端交換
 ▼
API Gateway（集中安全閘道）
 │
 │ ⑤ 驗證 OAuth Token（呼叫 OAuth Provider Token API）
 │
 │ ⑥ Token 驗證成功 → 建立 Session（儲存於 Redis 或 DB）
 │
 │ ⑦ 回傳 Set-Cookie: sessionId=xxxx 給 Browser
 ▼
Browser
 │
 │ ⑧ Cookie（sessionId）隨後續請求自動帶上
 ▼
API Gateway
 │
 │ ⑨ 解析 Cookie → 驗證 Session 是否有效
 ▼
API（後端業務服務）
```

好的，我把你提供的流程拆解，每個動作明確標示**前端 / 後端負責**，並附上一到兩行範例程式（Next.js +
NestJS 風格）。

---

## 🔄 帳號密碼登入流程

| 步驟                                   | 誰負責                    | 說明 / 範例                                                                                                                           |
| -------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ① 開啟 web-frontend-app 首頁           | 前端（Next.js）           | 直接 render 首頁頁面                                                                                                                  |
| ② 請求登入頁（選擇帳號密碼 / OAuth）   | 前端                      | `<Link href="/login">Login</Link>`                                                                                                    |
| ③ 輸入 email / password                | 前端                      | Next.js 表單提交：`fetch("/api-gateway/auth/login", { method:"POST", body: JSON.stringify({email,password}), credentials:"include"})` |
| ④ 將登入請求轉送至 api-auth            | 後端（NestJS）api-gateway | `return this.httpService.post('/api-auth/login', body)`                                                                               |
| ⑤ 驗證帳密（查 api-user / DB）         | 後端（NestJS）api-auth    | `const user = await this.userService.findByEmail(email)`                                                                              |
| ⑥ 建立 Session（儲存 Redis / Memory）  | 後端 api-auth             | `await this.sessionService.create(user.id)`                                                                                           |
| ⑦ 回傳 Set-Cookie: sessionId=xxxx      | 後端 api-auth             | `res.cookie('sessionId', sessionId, { httpOnly:true }); res.send({ok:true})`                                                          |
| ⑧ Browser 儲存 Cookie(sessionId)       | Browser 自動              | 無程式碼，瀏覽器自動處理                                                                                                              |
| ⑨ 重新導向至文件頁                     | 前端                      | `router.push("/document")`                                                                                                            |
| ⑩ 驗證 sessionId → 轉送至 api-document | 後端 api-gateway          | `const session = await this.sessionService.verify(cookie.sessionId)`                                                                  |
| ⑪ 回傳文件內容                         | 後端 api-document         | `return this.documentService.getAll()`                                                                                                |
| ⑫ 顯示頁面                             | 前端                      | `setDocuments(await res.json())`                                                                                                      |

---

## 🔄 OAuth 模擬流程（Mock）

| 步驟                                 | 誰負責               | 說明 / 範例                                                                                              |
| ------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------- |
| ③ 點選「使用 Google 登入」           | 前端                 | `<button onClick={() => window.location.href='/api-gateway/auth/mock-oauth'}>Login with Google</button>` |
| ④ 模擬授權 → 回傳 fake code          | 後端 api-auth (mock) | `res.redirect(`/callback?code=fake123`)`                                                                 |
| ⑤ 收到 code → 兌換 token             | 後端 api-auth        | `const token = this.oauthService.exchangeCode(code)`                                                     |
| ⑥ 建立使用者資料（查 api-user）      | 後端 api-auth        | `const user = await this.userService.findOrCreate(token.email)`                                          |
| ⑦ 建立 Session（Redis / Memory）     | 後端 api-auth        | `await this.sessionService.create(user.id)`                                                              |
| ⑧ 回傳 Set-Cookie: sessionId         | 後端 api-auth        | `res.cookie('sessionId', sessionId, { httpOnly:true }).send({ok:true})`                                  |
| ⑨ 前端重新導向到文件頁               | 前端                 | `window.location.href = '/document'`                                                                     |
| ⑩ 驗證 sessionId → 轉送 api-document | 後端 api-gateway     | `const session = await this.sessionService.verify(cookie.sessionId)`                                     |
| ⑪ 回傳文件內容                       | 後端 api-document    | `return this.documentService.getAll()`                                                                   |
| ⑫ 顯示頁面                           | 前端                 | `setDocuments(await res.json())`                                                                         |

---

### 🔑 注意事項

1. **Cookie 自動附帶**：由瀏覽器自動完成，但前端 `fetch` 或 `axios` 必須 `credentials: "include"`。
2. **Session 建立與驗證**：都由 `api-auth` 負責，api-gateway 只做 middleware 驗證。
3. **OAuth Mock**：完全由 `api-auth` 模擬授權流程，回傳 fake code，再建立 session。
4. **文件頁保護**：`api-gateway` 驗證 sessionId，未登入返回 401，前端收到 401 後導向 `/login`。

---

# 🔄 登入流程（帳號密碼 + Mock OAuth）

```
使用者
 │
 ▼
Browser（瀏覽器）
 │
 │ ① 開啟 web-frontend-app 首頁
 │   - 實作: Next.js 頁面
 │   - 範例: <Link href="/">首頁</Link>
 ▼
web-frontend-app（前端應用）
 │
 │ ② 請求登入頁（選擇：帳號密碼 或 OAuth）
 │   - 實作: Next.js Page
 │   - 範例: router.push('/login')
 ▼
Browser
 │
 ├─▶ [帳號密碼登入流程]
 │     │
 │     │ ③ 輸入 email / password
 │     │   - 實作: Next.js Form 元件
 │     │   - 範例: <input type="password" name="password"/>
 │     ▼
 │     api-gateway
 │       │
 │       │ ④ 將登入請求轉送至 api-auth
 │       │   - 實作: NestJS Controller + HttpService
 │       │   - 範例: return this.httpService.post(`${AUTH_SERVICE}/login`, body)
 │       ▼
 │       api-auth
 │         │
 │         │ ⑤ 驗證帳密（查詢 user 資料 from api-user / DB）
 │         │   - 實作: NestJS Service + Repository
 │         │   - 範例: const user = await this.userRepo.findOne({ email })
 │         │
 │         │ ⑥ 登入成功 → 建立 Session（Redis / Memory）
 │         │   - 實作: NestJS Service
 │         │   - 範例: const sessionId = await this.sessionService.create(user.id)
 │         │
 │         │ ⑦ 回傳 Set-Cookie: sessionId=xxxx
 │         │   - 實作: NestJS Controller
 │         │   - 範例: res.cookie('sessionId', sessionId, { httpOnly: true }).send({ ok: true })
 │         ▼
 │       api-gateway → Browser（Set-Cookie）
 │         │
 │         │ ⑧ Browser 儲存 Cookie(sessionId)
 │         │   - 實作: 瀏覽器自動管理 Cookie
 │         ▼
 │         web-frontend-app
 │         │
 │         │ ⑨ 重新導向至文件頁（需要登入）
 │         │   - 實作: Next.js Router
 │         │   - 範例: router.push('/document')
 │         ▼
 │         api-gateway → 驗證 sessionId → 通過 → 轉送至 api-document
 │         │   - 實作: NestJS Middleware / Guard
 │         │   - 範例: sessionService.validate(req.cookies.sessionId)
 ▼
api-document
 │
 │ ⑩ 回傳文件內容
 │   - 實作: NestJS Controller / Service
 │   - 範例: return { content: '文件內容' }
 ▼
web-frontend-app
 │
 │ ⑪ 顯示頁面
 │   - 實作: Next.js Component
 │   - 範例: setDocument(res.content)

---

 └─▶ [OAuth 模擬流程 (Mock)]
       │
       │ ③ 點選「使用 Google 登入」
       │   - 實作: Next.js Button / Router
       │   - 範例: window.location.href='/api-gateway/auth/mock-oauth'
       │
       ▼
       web-frontend-app 模擬導向 OAuth Provider (Mock)
       │
       │ ④ 模擬授權 → 回傳 fake authorization code
       │   - 實作: api-auth Mock OAuth endpoint
       │   - 範例: res.redirect(`/api-gateway/auth/callback?code=fake123`)
       ▼
       api-gateway
         │
         │ ⑤ 收到 code → 傳給 api-auth 兌換 token
         │   - 實作: NestJS Controller + HttpService
         │   - 範例: return this.httpService.post(`${AUTH_SERVICE}/exchange-code`, { code })
         ▼
         api-auth
           │
           │ ⑥ 驗證 mock code → 建立使用者資料（查 api-user）
           │   - 實作: NestJS Service + api-user
           │   - 範例: user = await userService.findOrCreateByOauth(code)
           │
           │ ⑦ 建立 Session（儲存在 Redis / Memory）
           │   - 實作: NestJS Service
           │   - 範例: sessionId = await sessionService.create(user.id)
           │
           │ ⑧ 回傳 Set-Cookie: sessionId=xxxx
           │   - 實作: NestJS Controller
           │   - 範例: res.cookie('sessionId', sessionId, { httpOnly: true }).send({ ok: true })
           ▼
         api-gateway → Browser（Set-Cookie）
           │
           │ ⑨ 前端重新導向到文件頁
           │   - 實作: Next.js Router
           │   - 範例: router.push('/document')
           ▼
           api-gateway → 驗證 sessionId → 轉送 api-document
           │   - 實作: NestJS Middleware / Guard
           │   - 範例: sessionService.validate(req.cookies.sessionId)
           ▼
           api-document → 回傳頁面內容
           │   - 實作: NestJS Controller / Service
           │   - 範例: return { content: '文件內容' }
           ▼
           web-frontend-app 顯示文件頁
           │   - 實作: Next.js Component
           │   - 範例: setDocument(res.content)

```
