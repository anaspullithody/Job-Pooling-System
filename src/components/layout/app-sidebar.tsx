'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
export const company = {
  name: 'Job Pooling',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [{ id: '1', name: 'Job Pooling' }];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>('Job Pooling');

  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  // Fetch user role and company name
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleResponse, companyResponse] = await Promise.all([
          fetch('/api/auth/role'),
          fetch('/api/company/own')
        ]);

        if (roleResponse.ok) {
          const data = await roleResponse.json();
          setUserRole(data.role);
        }

        if (companyResponse.ok) {
          const data = await companyResponse.json();
          if (data.name) {
            setCompanyName(data.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true; // No role restriction
    if (!userRole) return false; // User role not loaded yet
    return item.roles.includes(userRole as any);
  });

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  // Update tenants with fetched company name
  const updatedTenants = [{ id: '1', name: companyName }];
  const activeTenant = updatedTenants[0];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={updatedTenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
          companyName={companyName}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
