/**
 * 所有权管理工具函数
 */

const OWNED_TREES_KEY = 'owned_trees';
const COLLECTED_TREES_KEY = 'collected_trees';

export interface CollectedTree {
  id: string;
  title: string;
  author_name?: string;
}

/**
 * 获取用户拥有的树 ID 列表
 */
export function getOwnedTrees(): string[] {
  try {
    const stored = localStorage.getItem(OWNED_TREES_KEY);
    if (!stored) return [];
    const list = JSON.parse(stored);
    return Array.isArray(list) ? list.map(String) : [];
  } catch (err) {
    console.error('Failed to read owned trees:', err);
    return [];
  }
}

/**
 * 检查用户是否拥有指定的树
 */
export function isTreeOwner(treeId: string | null): boolean {
  if (!treeId) return false;
  const owned = getOwnedTrees();
  return owned.includes(String(treeId));
}

/**
 * 将树 ID 添加到拥有列表
 */
export function addToOwnedTrees(treeId: string): void {
  try {
    const owned = getOwnedTrees();
    const idStr = String(treeId);
    if (!owned.includes(idStr)) {
      owned.push(idStr);
      localStorage.setItem(OWNED_TREES_KEY, JSON.stringify(owned));
    }
  } catch (err) {
    console.error('Failed to add to owned trees:', err);
  }
}

/**
 * 获取收藏的树列表
 */
export function getCollectedTrees(): CollectedTree[] {
  try {
    const stored = localStorage.getItem(COLLECTED_TREES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to read collected trees:', err);
    return [];
  }
}

/**
 * 检查树是否已收藏
 */
export function isTreeCollected(treeId: string | null): boolean {
  if (!treeId) return false;
  const collected = getCollectedTrees();
  return collected.some(t => String(t.id) === String(treeId));
}

/**
 * 切换收藏状态
 */
export function toggleCollectTree(tree: { id: string; title: string; author_name?: string }): CollectedTree[] {
  try {
    const collected = getCollectedTrees();
    const idStr = String(tree.id);
    const existingIndex = collected.findIndex(t => String(t.id) === idStr);

    if (existingIndex >= 0) {
      // 取消收藏
      collected.splice(existingIndex, 1);
    } else {
      // 添加收藏
      collected.push({
        id: idStr,
        title: tree.title,
        author_name: tree.author_name || 'Anonymous',
      });
    }

    localStorage.setItem(COLLECTED_TREES_KEY, JSON.stringify(collected));
    return collected;
  } catch (err) {
    console.error('Failed to toggle collect tree:', err);
    return getCollectedTrees();
  }
}

