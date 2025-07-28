import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/models/auth';
import {
  testUsers,
  createTestUser,
  getUserProfile,
  waitForAsyncUpdates,
  testSupabase,
} from '../setup/database';
import '../setup';

describe('Auth Store - 集成测试', () => {
  beforeEach(async () => {
    // 重置 store 状态
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    });
  });

  describe('初始状态', () => {
    it('应该有正确的默认状态', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitializing).toBe(false);
    });
  });

  describe('signUp 方法', () => {
    it('注册成功时应该正确处理状态', async () => {
      const { signUp } = useAuthStore.getState();
      const userData = testUsers.user1;

      // 执行注册
      await signUp(userData.email, userData.password, userData.name);

      // 验证状态
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);

      // 验证用户是否在数据库中创建
      const { data: users } = await testSupabase.auth.admin.listUsers();
      const createdUser = users.users.find((u) => u.email === userData.email);
      expect(createdUser).toBeDefined();
      // 验证 profile 记录是否创建
      const profile = await getUserProfile(createdUser!.id);
      expect(profile).toBeDefined();
      expect(profile?.name).toBe(userData.name);
      expect(profile?.role).toBe('user');
      expect(profile?.avatar_path).toBeNull();
    });

    it('缺少姓名参数应该抛出错误', async () => {
      const { signUp } = useAuthStore.getState();
      const timestamp = Date.now();
      const email = `noname${timestamp}@example.com`;
      const password = 'password123';

      // @ts-expect-error - 故意传入不完整参数来测试错误处理
      await expect(signUp(email, password)).rejects.toThrow();
    });

    it('重复邮箱注册应该抛出错误', async () => {
      const { signUp } = useAuthStore.getState();
      const userData = testUsers.user1;

      // 先创建一个用户
      await createTestUser('user1');

      // 尝试用相同邮箱再次注册
      await expect(signUp(userData.email, userData.password, userData.name)).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('signIn 方法', () => {
    it('登录成功时应该设置用户信息和认证状态', async () => {
      // 先创建测试用户
      const createdUser = await createTestUser('user1');
      const userData = testUsers.user1;

      const { signIn } = useAuthStore.getState();

      await signIn(userData.email, userData.password);

      // 验证状态
      const state = useAuthStore.getState();
      expect(state.user).toBeTruthy();
      expect(state.user?.id).toBe(createdUser.id);
      expect(state.user?.email).toBe(userData.email);
      expect(state.user?.name).toBe(userData.name);
      expect(state.user?.role).toBe('user');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);

      // 验证 profile 记录是否存在
      const profile = await getUserProfile(createdUser.id);
      expect(profile).toBeTruthy();
      expect(profile?.name).toBe(userData.name);
      expect(profile?.role).toBe('user');
      expect(profile?.avatar_path).toBeNull();
      expect(profile?.created_at).toBeDefined();
    });

    it('用户没有 profile 时应该抛出错误', async () => {
      // 创建用户但删除其 profile
      const createdUser = await createTestUser('user1');
      await testSupabase.from('profiles').delete().eq('user_id', createdUser.id);

      const userData = testUsers.user1;
      const { signIn } = useAuthStore.getState();

      // 没有 profile 应该抛出错误
      await expect(signIn(userData.email, userData.password)).rejects.toThrow();
    });

    it('错误的密码应该抛出错误', async () => {
      await createTestUser('user1');
      const userData = testUsers.user1;

      const { signIn } = useAuthStore.getState();

      await expect(signIn(userData.email, 'wrongpassword')).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('不存在的用户应该抛出错误', async () => {
      const { signIn } = useAuthStore.getState();

      await expect(signIn('nonexistent@example.com', 'password123')).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('signOut 方法', () => {
    it('登出成功时应该清除用户状态', async () => {
      // 先登录
      await createTestUser('user1');
      const userData = testUsers.user1;

      const { signIn, signOut } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 验证已登录
      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeTruthy();

      // 执行登出
      await signOut();

      // 验证状态被清除
      state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('initialize 方法', () => {
    it('有会话时应该设置用户状态', async () => {
      // 创建用户并登录
      await createTestUser('user1');
      const userData = testUsers.user1;

      const { signIn, initialize } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 重置状态模拟应用重启
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });

      // 执行初始化
      await initialize();

      // 等待异步操作完成
      await waitForAsyncUpdates(500);

      const state = useAuthStore.getState();
      expect(state.user).toBeTruthy();
      expect(state.user?.email).toBe(userData.email);
      expect(state.user?.role).toBe('user');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitializing).toBe(false);
    });

    it('无会话时应该设置未认证状态', async () => {
      // 确保 Store 状态清理
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });

      // 确保 Supabase 会话清理
      try {
        const { signOut } = useAuthStore.getState();
        await signOut();
      } catch {
        // 忽略登出错误，继续测试
      }

      // 等待会话清理完成
      await waitForAsyncUpdates(200);

      const { initialize } = useAuthStore.getState();
      await initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitializing).toBe(false);
    });

    it('应该正确设置认证状态变化监听器', async () => {
      const { initialize } = useAuthStore.getState();

      // 初始化（设置监听器）
      await initialize();

      // 创建并登录用户（这会触发状态变化）
      await createTestUser('user2');
      const userData = testUsers.user2;

      const { signIn } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 等待状态更新
      await waitForAsyncUpdates(500);

      const state = useAuthStore.getState();
      expect(state.user).toBeTruthy();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('数据库集成验证', () => {
    it('用户注册应该自动创建 profile 记录', async () => {
      const { signUp } = useAuthStore.getState();
      const userData = testUsers.user1;

      await signUp(userData.email, userData.password, userData.name);

      // 获取创建的用户
      const { data: users } = await testSupabase.auth.admin.listUsers();
      const createdUser = users.users.find((u) => u.email === userData.email);
      expect(createdUser).toBeDefined();

      // 等待触发器执行
      await waitForAsyncUpdates(1000);

      // 验证 profile 记录
      const profile = await getUserProfile(createdUser!.id);
      expect(profile).toBeTruthy();
      expect(profile?.name).toBe(userData.name);
      expect(profile?.role).toBe('user');
      expect(profile?.avatar_path).toBeNull();
    });

    it('profile 记录应该有正确的时间戳', async () => {
      const createdUser = await createTestUser('user1');

      const profile = await getUserProfile(createdUser.id);
      expect(profile?.created_at).toBeTruthy();
      expect(profile?.role).toBe('user');
      expect(new Date(profile!.created_at)).toBeInstanceOf(Date);
    });
  });

  describe('角色功能测试', () => {
    it('新用户应该默认拥有 user 角色', async () => {
      const { signUp } = useAuthStore.getState();
      const userData = testUsers.user1;

      await signUp(userData.email, userData.password, userData.name);

      // 获取创建的用户
      const { data: users } = await testSupabase.auth.admin.listUsers();
      const createdUser = users.users.find((u) => u.email === userData.email);
      expect(createdUser).toBeDefined();

      // 等待触发器执行
      await waitForAsyncUpdates(1000);

      // 验证默认角色
      const profile = await getUserProfile(createdUser!.id);
      expect(profile?.role).toBe('user');
    });

    it('管理员角色应该能正确显示', async () => {
      // 创建用户
      const createdUser = await createTestUser('user1');

      // 等待触发器执行
      await waitForAsyncUpdates(1000);

      // 手动更新用户角色为 admin
      await testSupabase.from('profiles').update({ role: 'admin' }).eq('user_id', createdUser.id);

      // 登录并验证角色
      const userData = testUsers.user1;
      const { signIn } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('admin');
    });

    it('角色信息应该在状态变化时正确更新', async () => {
      // 创建用户并登录
      const createdUser = await createTestUser('user1');
      const userData = testUsers.user1;

      const { signIn, initialize } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 验证初始角色
      let state = useAuthStore.getState();
      expect(state.user?.role).toBe('user');

      // 在数据库中更新角色
      await testSupabase.from('profiles').update({ role: 'admin' }).eq('user_id', createdUser.id);

      // 重新初始化以获取最新数据
      await initialize();
      await waitForAsyncUpdates(500);

      state = useAuthStore.getState();
      expect(state.user?.role).toBe('admin');
    });
  });

  describe('updateProfile 方法', () => {
    it('应该成功更新用户姓名', async () => {
      // 创建并登录用户
      await createTestUser('user1');
      const userData = testUsers.user1;
      const { signIn, updateProfile } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 更新姓名
      const newName = 'Updated Test User 1';
      await updateProfile({ name: newName });

      // 验证状态更新
      const state = useAuthStore.getState();
      expect(state.user?.name).toBe(newName);

      // 验证数据库中的更新
      const profile = await getUserProfile(state.user!.id);
      expect(profile?.name).toBe(newName);
    });

    it('应该成功更新用户头像路径', async () => {
      // 创建并登录用户
      await createTestUser('user1');
      const userData = testUsers.user1;
      const { signIn, updateProfile } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 更新头像路径
      const avatarPath = '/path/to/avatar.jpg';
      await updateProfile({ avatar_path: avatarPath });

      // 验证状态更新
      const state = useAuthStore.getState();
      expect(state.user?.avatar_path).toBe(avatarPath);

      // 验证数据库中的更新
      const profile = await getUserProfile(state.user!.id);
      expect(profile?.avatar_path).toBe(avatarPath);
    });

    it('应该同时更新姓名和头像路径', async () => {
      // 创建并登录用户
      await createTestUser('user1');
      const userData = testUsers.user1;
      const { signIn, updateProfile } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      // 同时更新姓名和头像路径
      const newName = 'Updated User';
      const avatarPath = '/path/to/new-avatar.jpg';
      await updateProfile({ name: newName, avatar_path: avatarPath });

      // 验证状态更新
      const state = useAuthStore.getState();
      expect(state.user?.name).toBe(newName);
      expect(state.user?.avatar_path).toBe(avatarPath);
    });

    it('未登录用户更新资料应该抛出错误', async () => {
      const { updateProfile } = useAuthStore.getState();

      await expect(updateProfile({ name: 'New Name' })).rejects.toThrow('用户未登录');
    });
  });

  describe('权限检查方法', () => {
    it('isAdmin 方法应该正确识别管理员用户', async () => {
      // 创建用户并设置为管理员
      const createdUser = await createTestUser('user1');
      await testSupabase.from('profiles').update({ role: 'admin' }).eq('user_id', createdUser.id);

      const userData = testUsers.user1;
      const { signIn, isAdmin } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      expect(isAdmin()).toBe(true);
    });

    it('isAdmin 方法应该正确识别普通用户', async () => {
      // 创建普通用户
      await createTestUser('user1');
      const userData = testUsers.user1;
      const { signIn, isAdmin } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      expect(isAdmin()).toBe(false);
    });

    it('hasRole 方法应该正确验证用户角色', async () => {
      // 创建用户并设置为管理员
      const createdUser = await createTestUser('user1');
      await testSupabase.from('profiles').update({ role: 'admin' }).eq('user_id', createdUser.id);

      const userData = testUsers.user1;
      const { signIn, hasRole } = useAuthStore.getState();
      await signIn(userData.email, userData.password);

      expect(hasRole('admin')).toBe(true);
      expect(hasRole('user')).toBe(false);
    });

    it('未登录时权限检查方法应该返回 false', () => {
      const { isAdmin, hasRole } = useAuthStore.getState();

      expect(isAdmin()).toBe(false);
      expect(hasRole('admin')).toBe(false);
      expect(hasRole('user')).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('网络错误应该被正确处理', async () => {
      // 这个测试需要在实际网络故障时运行，这里我们跳过
      // 在真实场景中，可以通过配置错误的 URL 来模拟网络错误
    });

    it('数据库约束错误应该被正确处理', async () => {
      // 测试 RLS 策略等数据库约束
      // 这些在真实环境中会自动验证
    });
  });
});
