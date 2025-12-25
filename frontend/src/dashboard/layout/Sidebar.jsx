import React from "react";
import {
  FaHome,
  FaBolt,
  FaBrain,
  FaTools,
  FaGoogle,
  FaCogs,
} from "react-icons/fa";

export default function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", label: "Overview", icon: FaHome },
    { id: "indexing", label: "Indexing", icon: FaBolt },
    { id: "content", label: "Content", icon: FaBrain },
    { id: "serp", label: "SERP", icon: FaGoogle },
    { id: "tools", label: "Tools", icon: FaTools },
    { id: "settings", label: "Settings", icon: FaCogs },
  ];

  return (
    <>
      <aside className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-slate-200 flex justify-between items-center px-4 h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${isActive ? "text-accent" : "text-slate-400"
                  }`}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? "text-accent" : "text-slate-500"
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>

      <aside className="hidden md:flex flex-col w-full h-full bg-white border-r border-slate-200">
        <div className="px-6 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-wide text-slate-800 flex items-center gap-2">
            LGTS <span className="italic text-accent">Lynx</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {items.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                    ? "text-accent bg-accent/5 ring-1 ring-accent/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

      </aside>
    </>
  );
}