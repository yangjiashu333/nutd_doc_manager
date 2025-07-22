import { Briefcase, Database, Code, BookOpen, FileText, BarChart3, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Link } from 'react-router';

// Menu items.
const items = [
  {
    title: '项目',
    url: '/dashboard',
    icon: Briefcase,
  },
  {
    title: '数据集',
    url: '/dataset',
    icon: Database,
  },
  {
    title: '代码库',
    url: '/code',
    icon: Code,
  },
  {
    title: '论文',
    url: '/paper',
    icon: BookOpen,
  },
  {
    title: '专利',
    url: '/patent',
    icon: FileText,
  },
  {
    title: '图表',
    url: '/chart',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <Sidebar>
      {isAuthenticated && user && (
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={`https://picsum.photos/seed/${user.username}/200`}
                alt={user.username}
              />
              <AvatarFallback className="text-xl">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center flex-1">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isAuthenticated && (
        <SidebarFooter className="border-t">
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full flex items-center justify-center"
          >
            Logout
            <User className="h-4 w-4" />
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
