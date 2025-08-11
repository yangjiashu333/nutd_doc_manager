import { beforeAll, afterAll, beforeEach } from 'vitest';
import { verifyDatabaseState, resetTestEnvironment } from './database';

// Mock localStorage for Node.js test environment
const mockStorage = {
  data: new Map<string, string>(),
  getItem(key: string) {
    return this.data.get(key) || null;
  },
  setItem(key: string, value: string) {
    this.data.set(key, value);
  },
  removeItem(key: string) {
    this.data.delete(key);
  },
  clear() {
    this.data.clear();
  },
  get length() {
    return this.data.size;
  },
  key(index: number) {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  },
};

// Set up global storage mock
Object.defineProperty(global, 'localStorage', {
  value: mockStorage,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockStorage,
  writable: true,
});

// 全局测试设置
beforeAll(async () => {
  console.log('🔧 开始测试环境设置...');

  // 验证数据库连接
  const isDbHealthy = await verifyDatabaseState();
  if (!isDbHealthy) {
    throw new Error('数据库连接失败，请确保 Supabase 本地服务正在运行');
  }

  // 重置测试环境
  await resetTestEnvironment();

  console.log('✅ 测试环境准备完成');
});

// 每个测试前重置环境
beforeEach(async () => {
  await resetTestEnvironment();
});

// 全局测试清理
afterAll(async () => {
  console.log('🧹 开始清理测试环境...');
  await resetTestEnvironment();
  console.log('✅ 测试环境清理完成');
});
