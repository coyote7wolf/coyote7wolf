#!/bin/bash

# ============================================
# 🚀 Angular OAuth 應用 - 完整演示指南
# ============================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     Angular OAuth Simulation - 完整功能演示 (Step by Step)     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: 驗證項目結構
echo "📁 Step 1: 驗證項目結構"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Components 結構:"
ls -la src/app/components/ | grep "^d" | awk '{print "   - " $NF}'
echo ""
echo "✅ Services 結構:"
ls -la src/app/services/ | grep "\.ts$" | awk '{print "   - " $NF}'
echo ""

# Step 2: 驗證依賴安裝
echo "📦 Step 2: 驗證依賴安裝"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Node.js 版本:"
node --version
echo ""
echo "✅ npm 版本:"
npm --version
echo ""
echo "✅ Angular CLI 版本:"
ng version | head -1
echo ""

# Step 3: 代碼統計
echo "📊 Step 3: 代碼統計"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 源代碼文件數:"
find src/app -type f \( -name "*.ts" -o -name "*.html" -o -name "*.css" \) | wc -l
echo "   個文件"
echo ""
echo "✅ TypeScript 代碼行數:"
find src/app -name "*.ts" -type f -exec wc -l {} + | tail -1 | awk '{print "   " $1 " 行"}'
echo ""
echo "✅ HTML 模板行數:"
find src/app -name "*.html" -type f -exec wc -l {} + | tail -1 | awk '{print "   " $1 " 行"}'
echo ""

# Step 4: 顯示核心功能清單
echo "✨ Step 4: 核心功能清單"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 認證功能:"
echo "   • Email/Password 登錄 (表單驗證)"
echo "   • OAuth 提供商模擬 (Google, GitHub, Microsoft)"
echo "   • 會話管理 (localStorage 持久化)"
echo "   • 登錄記住我功能"
echo ""
echo "✅ 路由保護:"
echo "   • 路由守衛 (Auth Guard)"
echo "   • 受保護的儀表板"
echo "   • 未認證用戶重定向"
echo ""
echo "✅ 用戶界面:"
echo "   • 響應式設計 (移動友好)"
echo "   • 梯度背景"
echo "   • 加載狀態指示器"
echo "   • 錯誤消息顯示"
echo "   • 用戶頭像生成"
echo ""

# Step 5: API/服務演示
echo "🔧 Step 5: 服務 API 演示"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ AuthService 方法:"
echo "   • login(credentials) → Promise<User>"
echo "   • handleOAuthCallback(provider, userData) → Promise<User>"
echo "   • logout() → void"
echo "   • getCurrentUser() → User | null"
echo "   • isAuthenticated() → boolean"
echo ""
echo "✅ 可觀測流 (Observables):"
echo "   • currentUser$ → BehaviorSubject<User | null>"
echo "   • isAuthenticated$ → BehaviorSubject<boolean>"
echo ""

# Step 6: 路由配置
echo "🛣️  Step 6: 路由配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 應用路由:"
echo "   / (Home)                  → HomeComponent"
echo "   /login                    → LoginComponent"
echo "   /auth/callback            → AuthCallbackComponent"
echo "   /dashboard (保護)         → DashboardComponent [需要認證]"
echo ""

# Step 7: 文件大小
echo "📊 Step 7: 編譯輸出大小"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -d "dist/angular-web-app-template" ]; then
  echo "✅ 分佈式大小:"
  du -sh dist/angular-web-app-template
  echo ""
  echo "✅ 主要文件:"
  ls -lh dist/angular-web-app-template/ | tail -3 | awk '{printf "   %-30s %6s\n", $NF, $5}'
else
  echo "⚠️  未編譯 (未運行 ng build)"
fi
echo ""

# Step 8: 測試场景
echo "🧪 Step 8: 可測試的場景"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 場景 1: Email/Password 登錄"
echo "   步驟:"
echo "   1. 打開 http://localhost:4200/login"
echo "   2. 輸入郵箱: user@example.com"
echo "   3. 輸入密碼: password123"
echo "   4. 點擊 'Sign in'"
echo "   ✓ 預期: 重定向到 /dashboard"
echo ""
echo "✅ 場景 2: OAuth 流程模擬"
echo "   步驟:"
echo "   1. 打開 http://localhost:4200/login"
echo "   2. 點擊任何 OAuth 按鈕 (Google/GitHub/Microsoft)"
echo "   3. 等待重定向"
echo "   ✓ 預期: /auth/callback → 自動登錄 → /dashboard"
echo ""
echo "✅ 場景 3: 會話持久化"
echo "   步驟:"
echo "   1. 登錄到儀表板"
echo "   2. 按 Ctrl+R 刷新頁面"
echo "   ✓ 預期: 仍在儀表板上"
echo ""
echo "✅ 場景 4: 路由保護"
echo "   步驟:"
echo "   1. 打開瀏覽器控制台"
echo "   2. 運行: localStorage.removeItem('auth_user')"
echo "   3. 直接訪問 /dashboard"
echo "   ✓ 預期: 重定向到 /login"
echo ""

# Step 9: 啟動命令
echo "🚀 Step 9: 啟動應用"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 運行命令:"
echo ""
echo "   開發服務器:"
echo "   $ ng serve"
echo ""
echo "   打開瀏覽器:"
echo "   http://localhost:4200/"
echo ""
echo "   生產構建:"
echo "   $ ng build --configuration production"
echo ""

# Step 10: 文檔
echo "📚 Step 10: 文檔資源"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 可用文檔:"
echo "   • QUICKSTART.md           - 快速入門指南 (3 分鐘)"
echo "   • OAUTH_GUIDE.md          - OAuth 流程詳解"
echo "   • IMPLEMENTATION_GUIDE.md - 實現詳解和架構"
echo "   • DEPLOYMENT.md           - 部署策略"
echo "   • PROJECT_SUMMARY.md      - 項目概述"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                     ✅ 演示完成！                              ║"
echo "║  應用已準備好進行測試。請訪問 http://localhost:4200          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
