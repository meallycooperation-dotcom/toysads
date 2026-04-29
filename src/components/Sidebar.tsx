import { LayoutDashboard, User, Package, CreditCard, Plus, ShoppingBag, LogOut, Shield } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Sidebar() {
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
      isActive
        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <aside className="w-full lg:w-80 bg-slate-950 text-white lg:min-h-screen lg:sticky lg:top-0">
      <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Toys Admin</p>
              <h1 className="text-xl font-semibold">Control Room</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Manage products, orders, transactions, and customer delivery flow from one place.
          </p>
        </div>

        <nav className="space-y-2">
          <NavLink className={linkClass} to="/">
            <LayoutDashboard size={18} /> Home
          </NavLink>

          <NavLink className={linkClass} to="/products">
            <ShoppingBag size={18} /> Products
          </NavLink>

          <NavLink className={linkClass} to="/add-product">
            <Plus size={18} /> Add Product
          </NavLink>

          <NavLink className={linkClass} to="/orders">
            <Package size={18} /> Orders
          </NavLink>

          <NavLink className={linkClass} to="/transactions">
            <CreditCard size={18} /> Transactions
          </NavLink>

          <NavLink className={linkClass} to="/profile">
            <User size={18} /> Profile
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  )
}
