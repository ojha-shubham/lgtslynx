import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ active, setActive, title, children, user }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      
      <div className="md:hidden">
         <Sidebar active={active} setActive={setActive} />
      </div>

      <div className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-white">
        <Sidebar active={active} setActive={setActive} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title={title} user={user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}