#!/bin/bash

# 🚀 SyncCoreAI Web App - Route Validation Script
# This script performs comprehensive validation of all app routes

echo "🔍 SyncCoreAI Web App - Route Validation"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Project Structure Validation${NC}"
echo "================================="

# Check key directories
directories=(
    "src/app"
    "src/components"
    "src/config"
    "src/utils"
    "src/styles"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir${NC}"
    else
        echo -e "${RED}❌ $dir${NC}"
    fi
done

echo ""
echo -e "${BLUE}🗺️ Route File Validation${NC}"
echo "========================="

# Check route files
routes=(
    "src/app/page.tsx:Landing Page"
    "src/app/login/page.tsx:Login Page"
    "src/app/register/page.tsx:Register Page"
    "src/app/dashboard/page.tsx:Dashboard Page"
    "src/app/documents/page.tsx:Documents Page"
    "src/app/profile/page.tsx:Profile Page"
    "src/app/file-upload-demo/page.tsx:File Upload Demo"
    "src/app/image-editor-demo/page.tsx:Image Editor Demo"
    "src/app/demos/media-player/page.tsx:Media Player Demo"
    "src/app/touch-demo/page.tsx:Touch Demo"
    "src/app/performance-pwa-demo/page.tsx:PWA Demo"
    "src/app/design-system/page.tsx:Design System"
    "src/app/test/page.tsx:Test Page"
    "src/app/test-auth/page.tsx:Auth Test Page"
    "src/app/routes/page.tsx:Route Status Page"
)

for route in "${routes[@]}"; do
    file=$(echo "$route" | cut -d':' -f1)
    name=$(echo "$route" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC} - $file"
    else
        echo -e "${RED}❌ $name${NC} - $file"
    fi
done

echo ""
echo -e "${BLUE}🧩 Component Validation${NC}"
echo "======================="

# Check key components
components=(
    "src/components/navigation/GlobalNavigation.tsx:Global Navigation"
    "src/components/navigation/RouteStatusDashboard.tsx:Route Status Dashboard"
    "src/components/navigation/NavigationTester.tsx:Navigation Tester"
    "src/components/ui/Button.tsx:Button Component"
    "src/components/ui/Card.tsx:Card Component"
    "src/components/media/MediaPlayer.tsx:Media Player"
    "src/components/file/FileUpload.tsx:File Upload"
    "src/components/editor/ImageEditor.tsx:Image Editor"
)

for component in "${components[@]}"; do
    file=$(echo "$component" | cut -d':' -f1)
    name=$(echo "$component" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
    else
        echo -e "${RED}❌ $name${NC}"
    fi
done

echo ""
echo -e "${BLUE}⚙️ Configuration Files${NC}"
echo "======================"

# Check configuration files
configs=(
    "src/config/routes.ts:Route Configuration"
    "tsconfig.json:TypeScript Config"
    "next.config.js:Next.js Config"
    "package.json:Package Configuration"
    "tailwind.config.js:Tailwind Config"
)

for config in "${configs[@]}"; do
    file=$(echo "$config" | cut -d':' -f1)
    name=$(echo "$config" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
    else
        echo -e "${RED}❌ $name${NC}"
    fi
done

echo ""
echo -e "${BLUE}📚 Documentation Files${NC}"
echo "======================"

# Check documentation
docs=(
    "README.md:Project README"
    "UI_UX_WORKFLOW.md:UI/UX Workflow"
    "APP_STATUS.md:Application Status"
)

for doc in "${docs[@]}"; do
    file=$(echo "$doc" | cut -d':' -f1)
    name=$(echo "$doc" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
    else
        echo -e "${RED}❌ $name${NC}"
    fi
done

echo ""
echo -e "${BLUE}🔧 Utility Files${NC}"
echo "================"

# Check utilities
utils=(
    "src/utils/mediaPlayer.ts:Media Player Utils"
    "src/utils/filePreview.ts:File Preview Utils"
    "src/utils/fileUpload.ts:File Upload Utils"
    "src/utils/imageEditor.ts:Image Editor Utils"
    "src/utils/touchOptimization.ts:Touch Optimization"
)

for util in "${utils[@]}"; do
    file=$(echo "$util" | cut -d':' -f1)
    name=$(echo "$util" | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
    else
        echo -e "${RED}❌ $name${NC}"
    fi
done

echo ""
echo -e "${YELLOW}📊 Summary${NC}"
echo "=========="

# Count files
total_routes=$(echo "${routes[@]}" | wc -w)
total_components=$(echo "${components[@]}" | wc -w)
total_configs=$(echo "${configs[@]}" | wc -w)
total_docs=$(echo "${docs[@]}" | wc -w)
total_utils=$(echo "${utils[@]}" | wc -w)

echo "Routes: $total_routes"
echo "Components: $total_components"
echo "Configs: $total_configs"
echo "Docs: $total_docs"
echo "Utils: $total_utils"

echo ""
echo -e "${GREEN}🎉 Validation Complete!${NC}"
echo ""
echo "Visit the following URLs to test the application:"
echo "• Landing Page: http://localhost:3000/"
echo "• Route Status: http://localhost:3000/routes"
echo "• Navigation Test: http://localhost:3000/test"
echo "• Media Player Demo: http://localhost:3000/demos/media-player"
echo ""
echo "Run 'npm run dev' to start the development server."