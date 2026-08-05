import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
 

  return (
    <Sidebar variant="inset" {...props}>
      {/*Header */}
            <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<a href="#" />}
              className="bg-gradient-primary"
            >
              <div className="flex w-full items-center px-2 justify-between">
                <h1 className="text-xl font-bold text-white">ChatBox</h1>
                <div className="flex items-center gap-2">
                  <Sun className="size-4 text-white/80" />
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    className="data-[state=checked]:bg-background/80"
                  />
                  <Moon className="size-4 text-white/80" />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
        {/*Content */}
      <SidebarContent>
   
      </SidebarContent>
         {/*Footer */}

      <SidebarFooter>
        {/*<NavUser user={data.user} />*/}
      </SidebarFooter>
    </Sidebar>
  )
}
