export interface RecentTree {
  id: string;
  title: string;
  timestamp: number;
}

const STORAGE_KEY = 'recent_trees';
const MAX_RECENT_TREES = 5;

/**
 * 严格去重保存到最近访问列表（修复类型不匹配问题）
 * 使用显式字符串转换确保去重正确
 * @returns 更新后的历史记录数组，用于立即更新 UI 状态
 */
export function saveToHistory(tree: { id: string | number; title: string }): RecentTree[] {
  if (!tree || !tree.id) {
    return getRecentTrees();
  }

  try {
    // 1. 读取当前历史记录
    const raw = localStorage.getItem(STORAGE_KEY);
    let history: RecentTree[] = raw ? JSON.parse(raw) : [];

    // 2. 过滤掉现有条目（强制字符串转换以确保类型安全）
    // 这是修复：String(h.id) !== String(tree.id)
    history = history.filter(h => String(h.id) !== String(tree.id));

    // 3. 将更新的树添加到前面
    history.unshift({
      id: String(tree.id), // 确保 ID 是字符串
      title: tree.title || 'Untitled', // 确保标题是最新的
      timestamp: Date.now()
    });

    // 4. 限制为 5 个项目
    history = history.slice(0, MAX_RECENT_TREES);

    // 5. 保存回 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // 6. 返回新的历史记录，以便 UI 可以立即更新状态
    return history;
  } catch (err) {
    console.error('Failed to save to recent trees:', err);
    return getRecentTrees();
  }
}

/**
 * 严格去重保存到最近访问列表（向后兼容的别名）
 * @deprecated 使用 saveToHistory 代替
 */
export function saveToRecentTrees(tree: { id: string; title: string }): void {
  saveToHistory(tree);
}

/**
 * 从 localStorage 读取最近访问列表
 */
export function getRecentTrees(): RecentTree[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to read recent trees:', err);
    return [];
  }
}

/**
 * 清理重复项（自愈功能）
 * 使用新的字符串转换逻辑清理现有重复项
 */
export function cleanupDuplicateRecentTrees(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let history: RecentTree[] = JSON.parse(raw);
    if (history.length === 0) return;

    // 使用 Map 来去重，保留每个 ID 的最新条目（最大的 timestamp）
    // 使用字符串转换确保类型安全
    const uniqueMap = new Map<string, RecentTree>();

    history.forEach(item => {
      const idKey = String(item.id);
      const existing = uniqueMap.get(idKey);
      if (!existing || item.timestamp > existing.timestamp) {
        uniqueMap.set(idKey, {
          ...item,
          id: String(item.id), // 确保 ID 是字符串
        });
      }
    });

    // 转换为数组，按时间戳降序排序，取前 5 个
    const cleaned = Array.from(uniqueMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_TREES);

    // 如果清理后的列表与原始列表不同，更新 localStorage
    if (cleaned.length !== history.length || 
        cleaned.some((item, index) => String(item.id) !== String(history[index]?.id) || item.title !== history[index]?.title)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch (err) {
    console.error('Failed to cleanup duplicate recent trees:', err);
  }
}

