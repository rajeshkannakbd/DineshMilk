import { NavLink } from "react-router-dom";
import { Milk, LayoutDashboard, Users, BarChart3 } from "lucide-react";

const navigation = [
  { path: "/", label: "Today", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/95 text-ink backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="
    h-11
    w-11
    overflow-hidden
    rounded-2xl
    bg-white
    shadow-soft
  "
            >
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Dinesh Milk"
                className="
      h-full
      w-full
      object-cover
    "
              />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">Dinesh Milk</div>
              <div className="text-[11px] font-bold uppercase tracking-[.18em] text-black/40">
                daily milk ledger
              </div>
            </div>
          </div>

          <nav className="hidden gap-1 rounded-2xl bg-white p-1 shadow-sm sm:flex">
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className="rounded-xl transition-all"
              >
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${isActive ? "bg-ink text-blue-600" : "text-black/50 hover:bg-black/5"}`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2.5}
                      className={isActive ? "text-blue-600" : "text-black/50"}
                    />
                    <span>{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-68px)] max-w-6xl px-4 py-6 pb-28 text-ink sm:px-6 sm:py-6 sm:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className="flex-1">
              {({ isActive }) => (
                <div
                  className={`mx-auto flex min-w-[78px] max-w-[100px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-black transition-all ${isActive ? "bg-ink shadow-sm" : "bg-transparent hover:bg-black/5"}`}
                >
                  <Icon
                    size={19}
                    strokeWidth={2.5}
                    className={isActive ? "text-blue-600" : "text-black/50"}
                  />
                  <span
                    className={isActive ? "text-blue-600" : "text-black/50"}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
