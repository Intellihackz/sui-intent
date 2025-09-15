import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="dark text-white">
      <SidebarHeader>
        <h1 className="text-5xl font-bold text-center border-b p-4">Intent</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className=" p-4">
        <p className="truncate border px-8 py-4 rounded-2xl">
          0xdf337bb549e017330a4f3fc8a25f57c975b864d7c6665d73154b8ef3671e0c34
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
