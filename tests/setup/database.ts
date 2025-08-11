import { createClient } from '@supabase/supabase-js';

// 测试环境的 Supabase 客户端 - 使用 vitest 配置的环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

// 使用 service_role key 进行管理操作
export const testSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 测试用户数据
export const testUsers = {
  user1: {
    email: 'test1@example.com',
    password: 'password123',
    name: 'Test User 1',
    role: 'user',
  },
  user2: {
    email: 'test2@example.com',
    password: 'password123',
    name: 'Test User 2',
    role: 'user',
  },
};

// 清理数据库中的测试数据
export async function cleanupTestData() {
  try {
    // 获取所有用户
    const { data: users } = await testSupabase.auth.admin.listUsers();
    const testEmails = Object.values(testUsers).map((user) => user.email);

    // 查找所有测试相关的用户（包括带时间戳的邮箱）
    const testUsersToDelete = users.users.filter((user) => {
      if (!user.email) return false;

      // 匹配固定的测试邮箱
      if (testEmails.includes(user.email)) return true;

      // 匹配带时间戳的测试邮箱模式
      if (
        user.email.includes('@example.com') &&
        (user.email.startsWith('noname') || user.email.startsWith('test'))
      ) {
        return true;
      }

      return false;
    });

    const testUserIds = testUsersToDelete.map((user) => user.id);

    // 删除 profiles 记录
    if (testUserIds.length > 0) {
      await testSupabase.from('profiles').delete().in('user_id', testUserIds);
    }

    // 删除测试用户
    for (const user of testUsersToDelete) {
      try {
        await testSupabase.auth.admin.deleteUser(user.id);
      } catch (error) {
        // 忽略单个用户删除失败，继续清理其他用户
        console.warn(`删除用户 ${user.email} 失败:`, error);
      }
    }

    // 确保登出所有会话
    try {
      await testSupabase.auth.signOut();
    } catch {
      // 忽略登出错误
    }

    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.warn('⚠️ 测试数据清理失败:', error);
  }
}

// 创建测试用户
export async function createTestUser(userKey: keyof typeof testUsers) {
  const userData = testUsers[userKey];

  try {
    const { data, error } = await testSupabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // 自动确认邮箱
    });

    if (error) {
      throw error;
    }

    // 创建对应的 profile 记录
    const { error: profileError } = await testSupabase.from('profiles').insert({
      user_id: data.user.id,
      name: userData.name,
      role: 'user',
      avatar_path: null,
    });

    if (profileError) {
      throw profileError;
    }

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
}

// 验证数据库状态
export async function verifyDatabaseState() {
  try {
    // 检查 Supabase 连接 - 使用简单的 select 查询
    const { error } = await testSupabase.from('profiles').select('id').limit(1);

    if (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }

    console.log('✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.error('❌ 数据库状态验证失败:', error);
    return false;
  }
}

// 等待异步操作完成的工具函数
export async function waitForAsyncUpdates(ms: number = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 重置测试环境
export async function resetTestEnvironment() {
  await cleanupTestData();
  await waitForAsyncUpdates(500); // 等待清理完成
}

// 获取用户的 profile 记录
export async function getUserProfile(userId: string) {
  const { data, error } = await testSupabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // 忽略记录不存在的错误
    throw error;
  }

  return data;
}
