/**
 * Homepage Tour Configuration
 *
 * Defines the tour steps for the homepage onboarding experience
 */

import { TourStep } from '@/components/tour/ProductTour'

export const homepageTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '歡迎來到 SyncCoreAI！',
    content:
      '讓我們快速了解一下主要功能，這將幫助您更好地使用我們的協作文檔平台。',
    position: 'center',
    showSkip: true,
    showPrevious: false,
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: '智能側邊欄',
    content:
      '這是我們的智能側邊欄。預設為圖示模式，將滑鼠懸停可展開，也可以固定展開狀態，還能調整寬度大小。',
    position: 'right',
    onBeforeShow: () => {
      // Ensure sidebar is visible
      const sidebar = document.querySelector(
        '[data-tour="sidebar"]'
      ) as HTMLElement
      if (sidebar) {
        sidebar.style.transform = 'translateX(0)'
      }
    },
  },
  {
    id: 'nav-home',
    target: '[data-tour="nav-home"]',
    title: '首頁導航',
    content: '點擊這裡隨時回到首頁，查看最新的功能和更新。',
    position: 'right',
  },
  {
    id: 'nav-documents',
    target: '[data-tour="nav-documents"]',
    title: '我的文檔',
    content: '在這裡管理您的所有文檔，包括創建、編輯、分享和協作功能。',
    position: 'right',
  },
  {
    id: 'nav-dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: '儀表板',
    content: '查看您的工作概覽、統計數據和團隊活動。',
    position: 'right',
  },
  {
    id: 'main-content',
    target: '[data-tour="main-content"]',
    title: '主要內容區域',
    content:
      '這裡顯示頁面的主要內容。側邊欄會智能調整，為內容提供最佳的顯示空間。',
    position: 'left',
  },
  {
    id: 'hero-section',
    target: '[data-tour="hero-section"]',
    title: '功能展示',
    content: '了解 SyncCoreAI 的核心功能：即時協作、AI 輔助編輯、版本控制等。',
    position: 'bottom',
  },
  {
    id: 'demo-buttons',
    target: '[data-tour="demo-buttons"]',
    title: '功能演示',
    content:
      '點擊這些按鈕可以體驗不同的功能演示，包括文件上傳、圖片編輯、觸控優化等。',
    position: 'top',
  },
  {
    id: 'responsive-design',
    target: '[data-tour="responsive-info"]',
    title: '響應式設計',
    content:
      '我們的應用完全響應式設計，在手機、平板和桌面設備上都有優秀的體驗。',
    position: 'top',
  },
]

export const sidebarTourSteps: TourStep[] = [
  {
    id: 'sidebar-hover',
    target: '[data-tour="sidebar"]',
    title: '懸停展開',
    content: '將滑鼠移到側邊欄上，它會自動展開顯示導航文字。',
    position: 'right',
  },
  {
    id: 'sidebar-pin',
    target: '[data-tour="sidebar-pin"]',
    title: '固定側邊欄',
    content: '點擊這個按鈕可以固定側邊欄為展開狀態，讓您更方便地導航。',
    position: 'right',
  },
  {
    id: 'sidebar-resize',
    target: '[data-tour="sidebar-resize"]',
    title: '調整大小',
    content: '拖拽這個邊框可以調整側邊欄的寬度，找到最適合您的大小。',
    position: 'right',
  },
]
