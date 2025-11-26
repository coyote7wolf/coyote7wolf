// Web Worker for data processing and filtering
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case "FILTER_DATA":
        handleFilterData(data);
        break;
      case "SORT_DATA":
        handleSortData(data);
        break;
      case "SEARCH_DATA":
        handleSearchData(data);
        break;
      case "GENERATE_DATA":
        handleGenerateData(data);
        break;
      case "CALCULATE_STATISTICS":
        handleCalculateStatistics(data);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: error.message,
      requestId: data.requestId,
    });
  }
});

// 數據過濾處理
function handleFilterData({ items, filters, requestId }) {
  const startTime = performance.now();

  let filteredItems = items;

  // 搜尋過濾
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query)
    );
  }

  // 類型篩選
  if (filters.selectedTypes && filters.selectedTypes.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      filters.selectedTypes.includes(item.type)
    );
  }

  // 部門篩選
  if (filters.selectedDepartments && filters.selectedDepartments.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      filters.selectedDepartments.includes(item.department)
    );
  }

  // 活躍狀態篩選
  if (filters.activeOnly !== undefined) {
    filteredItems = filteredItems.filter((item) =>
      filters.activeOnly ? item.isActive : !item.isActive
    );
  }

  // 日期範圍篩選
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    if (startDate || endDate) {
      filteredItems = filteredItems.filter((item) => {
        const itemDate = new Date(item.lastActive);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate)) return false;
        return true;
      });
    }
  }

  const processingTime = performance.now() - startTime;

  self.postMessage({
    type: "FILTER_DATA_COMPLETE",
    data: {
      filteredItems,
      originalCount: items.length,
      filteredCount: filteredItems.length,
      processingTime,
    },
    requestId,
  });
}

// 數據排序處理
function handleSortData({ items, sortBy, sortOrder, requestId }) {
  const startTime = performance.now();

  const sortedItems = [...items].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // 處理日期類型
    if (
      aValue instanceof Date ||
      (typeof aValue === "string" && !isNaN(Date.parse(aValue)))
    ) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // 處理數字類型
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    // 處理字符串類型
    const result = String(aValue).localeCompare(String(bValue), "zh-TW", {
      numeric: true,
      sensitivity: "base",
    });

    return sortOrder === "asc" ? result : -result;
  });

  const processingTime = performance.now() - startTime;

  self.postMessage({
    type: "SORT_DATA_COMPLETE",
    data: {
      sortedItems,
      processingTime,
    },
    requestId,
  });
}

// 數據搜尋處理（模糊搜尋）
function handleSearchData({ items, query, requestId }) {
  const startTime = performance.now();

  if (!query || query.trim() === "") {
    self.postMessage({
      type: "SEARCH_DATA_COMPLETE",
      data: {
        results: items,
        processingTime: 0,
      },
      requestId,
    });
    return;
  }

  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 0);

  const results = items
    .map((item) => {
      // 計算相關性分數
      let score = 0;
      const searchableText = [item.name, item.email, item.department, item.type]
        .join(" ")
        .toLowerCase();

      searchTerms.forEach((term) => {
        if (searchableText.includes(term)) {
          // 精確匹配獲得更高分數
          if (item.name.toLowerCase().includes(term)) score += 10;
          if (item.email.toLowerCase().includes(term)) score += 8;
          if (item.department.toLowerCase().includes(term)) score += 6;
          if (item.type.toLowerCase().includes(term)) score += 4;

          // 字符串開頭匹配獲得額外分數
          if (item.name.toLowerCase().startsWith(term)) score += 5;
          if (item.email.toLowerCase().startsWith(term)) score += 3;
        }
      });

      return { ...item, searchScore: score };
    })
    .filter((item) => item.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);

  const processingTime = performance.now() - startTime;

  self.postMessage({
    type: "SEARCH_DATA_COMPLETE",
    data: {
      results,
      totalMatches: results.length,
      processingTime,
    },
    requestId,
  });
}

// 數據生成處理
function handleGenerateData({ count, startIndex = 0, requestId }) {
  const startTime = performance.now();

  const names = [
    "王小明",
    "李小美",
    "張大華",
    "陳小芳",
    "劉志偉",
    "黃美玲",
    "林志強",
    "吳佳霖",
    "蔡志明",
    "鄭淑芬",
    "許建國",
    "周麗華",
    "呂文傑",
    "蘇雅婷",
    "何志豪",
    "謝美惠",
    "葉俊良",
    "賴淑娟",
    "高志成",
    "薛雅芳",
    "董建華",
    "盧美玲",
    "石志強",
    "田佳霖",
  ];

  const departments = [
    "技術部",
    "產品部",
    "設計部",
    "營運部",
    "人事部",
    "財務部",
    "市場部",
    "客服部",
  ];
  const itemTypes = ["員工", "經理", "實習生", "顧問"];
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ];

  const generateItem = (index) => {
    const nameIndex = index % names.length;
    const nameGroup = Math.floor(index / names.length) + 1;
    const name = `${names[nameIndex]} ${nameGroup > 1 ? nameGroup : ""}`.trim();

    // 使用簡單的偽隨機數生成器以確保一致性
    const seed = index * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    const random2 = ((seed * 2) % 233280) / 233280;
    const random3 = ((seed * 3) % 233280) / 233280;
    const random4 = ((seed * 4) % 233280) / 233280;

    return {
      id: `user-${startIndex + index}`,
      name,
      email: `user${startIndex + index}@company.com`,
      department: departments[Math.floor(random * departments.length)],
      type: itemTypes[Math.floor(random2 * itemTypes.length)],
      joinDate: new Date(Date.now() - random3 * 365 * 24 * 60 * 60 * 1000 * 3),
      lastActive: new Date(Date.now() - random4 * 7 * 24 * 60 * 60 * 1000),
      isActive: random > 0.3,
      color: colors[Math.floor(random * colors.length)],
      searchScore: 0,
    };
  };

  const items = [];
  const batchSize = 1000;

  for (let i = 0; i < count; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, count);
    const batch = [];

    for (let j = i; j < batchEnd; j++) {
      batch.push(generateItem(j));
    }

    items.push(...batch);

    // 發送進度更新
    if (i + batchSize < count) {
      self.postMessage({
        type: "GENERATE_DATA_PROGRESS",
        data: {
          progress: ((i + batchSize) / count) * 100,
          generated: i + batchSize,
          total: count,
        },
        requestId,
      });
    }
  }

  const processingTime = performance.now() - startTime;

  self.postMessage({
    type: "GENERATE_DATA_COMPLETE",
    data: {
      items,
      count: items.length,
      processingTime,
    },
    requestId,
  });
}

// 統計計算處理
function handleCalculateStatistics({ items, requestId }) {
  const startTime = performance.now();

  const stats = {
    total: items.length,
    active: 0,
    inactive: 0,
    departments: {},
    types: {},
    recentActivity: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    joinDateStats: {
      thisYear: 0,
      lastYear: 0,
      older: 0,
    },
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

  items.forEach((item) => {
    // 活躍狀態統計
    if (item.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // 部門統計
    stats.departments[item.department] =
      (stats.departments[item.department] || 0) + 1;

    // 類型統計
    stats.types[item.type] = (stats.types[item.type] || 0) + 1;

    // 最近活動統計
    const lastActive = new Date(item.lastActive);
    if (lastActive >= todayStart) {
      stats.recentActivity.today++;
    }
    if (lastActive >= weekStart) {
      stats.recentActivity.thisWeek++;
    }
    if (lastActive >= monthStart) {
      stats.recentActivity.thisMonth++;
    }

    // 加入日期統計
    const joinDate = new Date(item.joinDate);
    if (joinDate >= yearStart) {
      stats.joinDateStats.thisYear++;
    } else if (joinDate >= lastYearStart) {
      stats.joinDateStats.lastYear++;
    } else {
      stats.joinDateStats.older++;
    }
  });

  const processingTime = performance.now() - startTime;

  self.postMessage({
    type: "CALCULATE_STATISTICS_COMPLETE",
    data: {
      statistics: stats,
      processingTime,
    },
    requestId,
  });
}

// 錯誤處理
self.addEventListener("error", (error) => {
  self.postMessage({
    type: "WORKER_ERROR",
    error: {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
    },
  });
});

// 未處理的 Promise 拒絕
self.addEventListener("unhandledrejection", (event) => {
  self.postMessage({
    type: "WORKER_UNHANDLED_REJECTION",
    error: {
      reason: event.reason,
      promise: event.promise,
    },
  });
});
