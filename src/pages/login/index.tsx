import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/models/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

const registerSchema = z
  .object({
    email: z.email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少需要6个字符'),
    confirmPassword: z.string().min(6, '密码至少需要6个字符'),
    name: z.string().min(1, '请输入姓名'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密码不匹配',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, isLoading } = useAuthStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  async function onLoginSubmit(values: LoginFormData) {
    try {
      setError(null);
      await signIn(values.email, values.password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败，请检查邮箱和密码');
    }
  }

  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      setError(null);
      await signUp(values.email, values.password, values.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            {isRegisterMode ? '注册账户' : '登录到文档管理系统'}
          </CardTitle>
          <CardDescription className="text-center mt-1">
            {isRegisterMode ? '创建新账户以开始使用' : '请输入您的邮箱和密码以继续'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
          {isRegisterMode ? (
            <Form {...registerForm} key="registerForm">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入您的姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="请输入邮箱地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请输入密码（至少6个字符）" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>确认密码</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请再次输入密码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm} key="loginForm">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="请输入邮箱地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请输入密码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
                loginForm.reset();
                registerForm.reset();
              }}
            >
              {isRegisterMode ? '已有账户？立即登录' : '没有账户？立即注册'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
