import { Briefcase, Database, Code, BookOpen, FileText, BarChart3 } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
