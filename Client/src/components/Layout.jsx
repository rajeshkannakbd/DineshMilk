import { NavLink } from "react-router-dom";

import { Milk, LayoutDashboard, Users, BarChart3 } from "lucide-react";

const navigation = [
  {
    path: "/",
    label: "Today",
    icon: LayoutDashboard,
  },

  {
    path: "/customers",
    label: "Customers",
    icon: Users,
  },

  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      {/* HEADER */}

      <header
        className="
    sticky
    top-0
    z-40
    border-b
    border-black/5
    bg-cream/95
    text-ink
    backdrop-blur-xl
  "
      >
        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-4
            py-4
          "
        >
          {/* BRAND */}

          <div className="flex items-center gap-3">
            <div
              className="
                grid
                h-11
                w-11
                place-items-center
                rounded-2xl
                bg-ink
                text-white
                shadow-soft
              "
            >
              <Milk size={23} />
            </div>

            <div>
              <div
                className="
                  text-lg
                  font-black
                  tracking-tight
                "
              >
                MilkFlow
              </div>

              <div
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[.18em]
                  text-black/40
                "
              >
                daily milk ledger
              </div>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}

          <nav
            className="
              hidden
              gap-1
              rounded-2xl
              bg-white
              p-1
              shadow-sm
              sm:flex
            "
          >
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    py-2
                    text-sm
                    font-bold
                    transition

                    ${
                      isActive
                        ? "bg-ink text-blue-600"
                        : "text-black/50 hover:bg-black/5"
                    }
                  `}
              >
                <Icon size={16} />

                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* PAGE */}

      <main
        className="
          mx-auto
          max-w-6xl
          px-4
          py-6
          pb-24
        "
      >
        {children}
      </main>

      {/* MOBILE NAV */}

      {/* MOBILE NAVIGATION */}

      <nav
        className="
    fixed
    bottom-0
    left-0
    right-0
    z-50

    border-t
    border-black/5

    bg-white/95
    px-2
    pt-2

    pb-[calc(env(safe-area-inset-bottom)+8px)]

    shadow-[0_-8px_30px_rgba(0,0,0,0.08)]

    backdrop-blur-xl

    sm:hidden
  "
      >
        <div
          className="
      mx-auto
      flex
      max-w-md
      items-center
      justify-around
    "
        >
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
            flex
            min-w-[78px]
            flex-col
            items-center
            justify-center
            gap-1

            rounded-2xl

            px-3
            py-2

            text-[10px]
            font-black

            transition-all

            ${
              isActive
                ? "bg-ink text-white shadow-sm"
                : "text-black/40 hover:bg-black/5"
            }
          `}
            >
              <Icon size={19} strokeWidth={2.5} />

              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
