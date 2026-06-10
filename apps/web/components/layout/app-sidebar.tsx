// apps/web/components/layout/app-sidebar.tsx

"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Asterisk,
  Search,
  Users,
  Globe,
  Settings,
  ArrowUpCircle,
  LayoutTemplate,
  Sparkles,
  Map,
  SmilePlus,
  CircleDollarSign,
  Trash,
  Send,
  Book,
  LifeBuoy,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  MessageSquareHeart,
  Home,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  FileQuestion,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

import { useMe, useLogout } from "~/hooks/api/auth/index";
import { useGetAllMyForms } from "~/hooks/api/form";
import { useCommandSearch } from "~/hooks/use-command-search";
import { toast } from "sonner";

const MAIN_NAV = [
  { title: "Home", icon: Home, href: "/dashboard" },
  { title: "Search", icon: Search }, // this will trigger an command card to search
  { title: "Settings", icon: Settings, href: "/settings" },
  { title: "Upgrade plan", icon: ArrowUpCircle, href: "/pricing" },
];

const PRODUCT_NAV = [
  { title: "Templates", icon: LayoutTemplate, href: "/templates" },
  { title: "Feature requests", icon: SmilePlus }, // TODO: ADD ROUTE
  { title: "Trash", icon: Trash }, // dedicated component
];

const HELP_NAV = [
  { title: "Help center", icon: LifeBuoy },
  { title: "Contact support", icon: MessageCircle },
  { title: "How to guide", icon: FileQuestion },
];

interface User {
  email: string;
  fullName: string;
  id: string;
  profileImageUrl: string;
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { searchOpen, setSearchOpen, openSearch } = useCommandSearch();
  const { forms } = useGetAllMyForms(1, 10); // sidebar shows up to 10 forms
  const formList = forms?.forms ?? [];
  const [workspaceExpanded, setWorkspaceExpanded] = React.useState(false);

  const { user, isLoading } = useMe() as { user: User | undefined; isLoading: boolean };
  const { logout } = useLogout();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Don't render the sidebar content if we're redirecting
  if (!user) return null;

  const intialName = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const logOutHandler = () => {
    try {
      router.replace("/login");

      logout({});

      router.refresh();

      toast.success("Log Out Successful");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="pb-2">
        <div className="flex items-center justify-between w-full mt-2">
          <SidebarMenuButton size="sm" className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 rounded-full border border-gray-200 bg-white cursor-pointer">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback className="bg-transparent text-black/70 font-normal text-xs">
                      {intialName(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-[14px] text-black/70 cursor-pointer truncate">
                    {!isLoading && `${user?.fullName}`}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-none shadow-sm mt-2">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-[13px] text-sidebar-accent-foreground">
                    <BadgeCheckIcon />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] text-sidebar-accent-foreground">
                    <CreditCardIcon />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px] text-sidebar-accent-foreground">
                    <BellIcon />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[12px] text-sidebar-accent-foreground"
                  onClick={logOutHandler}
                >
                  <LogOutIcon />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuButton>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-md"
          >
            <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Main Nav */}
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-[2px]">
              {MAIN_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.title === "Search") {
                        openSearch();
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    isActive={item.href ? pathname === item.href : false}
                    className="text-[14px]! px-3 py-2 h-7 rounded-md cursor-pointer hover:text-primary!"
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspaces */}
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="text-[12px] font-medium text-gray-500 px-3 mb-1 flex items-center justify-between">
            Workspaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
                  className="text-[14px]! px-3 py-2 h-7 rounded-md cursor-pointer hover:text-primary! group"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {workspaceExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 mr-2" strokeWidth={2} />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 mr-2" strokeWidth={2} />
                    )}
                    <span className="truncate">My workspace</span>
                  </div>
                </SidebarMenuButton>
                {workspaceExpanded && formList.length > 0 && (
                  <SidebarMenuSub>
                    {formList.map((form) => {
                      const href = `/forms/${form.id}/settings`;
                      return (
                        <SidebarMenuSubItem key={form.id}>
                          <SidebarMenuSubButton
                            onClick={() => router.push(href)}
                            isActive={pathname === href}
                            className="text-[13px]! h-7 cursor-pointer hover:text-primary!"
                          >
                            <span className="truncate">{form.title || "Untitled"}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product */}
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="text-[13px] font-medium text-gray-500 px-3 mb-1">
            Product
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-[2px]">
              {PRODUCT_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => item.href && router.push(item.href)}
                    isActive={item.href ? pathname === item.href : false}
                    className="text-[14px]! px-3 py-2 h-7 rounded-md cursor-pointer hover:text-primary!"
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2} /> {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Help */}
        <SidebarGroup className="pt-6 pb-4">
          <SidebarGroupLabel className="text-[13px] font-medium text-gray-500 px-3 mb-1">
            Help
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-[2px]">
              {HELP_NAV.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="text-[14px]! px-3 py-2 h-7 rounded-md cursor-pointer hover:text-primary!">
                    <item.icon className="h-4 w-4" strokeWidth={2} /> {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="font-medium text-gray-900 bg-black/2! px-3 py-2 h-9 rounded-md w-full justify-start">
              <MessageSquareHeart className="mr-2 h-4 w-4" strokeWidth={2} />
              Give Feedback
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Search Command Palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search forms, pages, settings…" />
        <CommandList className="py-1.5!">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages" className="py-1.5!">
            <CommandItem
              className="py-1.5!"
              onSelect={() => {
                router.push("/dashboard");
                setSearchOpen(false);
              }}
            >
              <Home className="mr-2 h-4 w-4" /> Home
            </CommandItem>
            <CommandItem
              className="py-1.5!"
              onSelect={() => {
                router.push("/settings");
                setSearchOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </CommandItem>
            <CommandItem
              className="py-1.5!"
              onSelect={() => {
                router.push("/templates");
                setSearchOpen(false);
              }}
            >
              <LayoutTemplate className="mr-2 h-4 w-4" /> Templates
            </CommandItem>
          </CommandGroup>
          {formList.length > 0 && (
            <CommandGroup heading="My Forms" className="py-1.5!">
              {formList.map((form) => (
                <CommandItem
                  key={form.id}
                  onSelect={() => {
                    router.push(`/forms/${form.shortId}/edit`);
                    setSearchOpen(false);
                  }}
                  className="py-1.5!"
                >
                  <Asterisk className="mr-2 h-4 w-4" />
                  {form.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </Sidebar>
  );
}

export function FloatingSidebarTrigger() {
  const { state, toggleSidebar } = useSidebar();

  if (state !== "collapsed") return null;

  return (
    <button
      onClick={toggleSidebar}
      className="absolute top-4 left-4 z-50 text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-md flex items-center justify-center"
      title="Show Sidebar"
    >
      <ChevronsRight className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
