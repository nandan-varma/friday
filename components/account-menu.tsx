"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"

export function AccountMenu() {

  const MenuItems = [
    { title: "Settings", url: "/settings" },
    { title: "Sign Out", url: "/logout" },
  ]

  const router = useRouter()
  const session = useSession()
  const [selectedItem, setSelectedItem] = React.useState(MenuItems[0].title)

  React.useEffect(() => {
    if (selectedItem !== MenuItems[0].title) {
      router.push("/account/profile")
    }
  }, [selectedItem, router])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{session.data?.user.name}</span>
                <span className=""></span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {MenuItems.map((item) => (
              <DropdownMenuItem
                key={item.title}
                onSelect={() => setSelectedItem(item.title)}
              >
                <Link href={item.url} className="flex items-center gap-2">
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
