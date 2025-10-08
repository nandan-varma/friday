"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MessageSquare,
  Settings,
  Menu,
  X,
  Plus,
  Search,
  Bell,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { client } from "@/lib/auth-client";
import logger from "@/lib/logger";

const navigation = [
  { name: "Calendar", href: "/dashboard", icon: Calendar },
  { name: "AI Assistant", href: "/dashboard/ai", icon: MessageSquare },
  { name: "Sessions", href: "/sessions", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await client.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Friday</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isActive && "bg-secondary text-secondary-foreground",
                    )}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </h3>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10"
                onClick={() => {
                  // TODO: Open create event modal
                  logger.info("Open create event modal");
                }}
              >
                <Plus className="w-4 h-4" />
                New Event
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10"
                onClick={() => {
                  // TODO: Open search
                  logger.info("Open search");
                }}
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </ScrollArea>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">
                  user@example.com
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xs border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {pathname === "/dashboard" && "Calendar"}
                  {pathname === "/dashboard/ai" && "AI Assistant"}
                  {pathname === "/sessions" && "Sessions"}
                  {pathname === "/settings" && "Settings"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {pathname === "/dashboard" &&
                    "Manage your events and schedule"}
                  {pathname === "/dashboard/ai" &&
                    "Get help with your calendar"}
                  {pathname === "/sessions" && "Manage your active sessions"}
                  {pathname === "/settings" && "Configure your preferences"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
