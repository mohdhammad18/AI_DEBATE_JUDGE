import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from './api/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Gavel, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  LogIn, 
  UserPlus 
} from 'lucide-react'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = auth.getToken()
  const [menuOpen, setMenuOpen] = useState(false)

  function logout() {
    auth.logout()
    toast.success('Session terminated successfully')
    navigate('/login')
  }

  // Helper component for Nav Links to ensure consistent styling
  const NavLink = ({ to, icon: Icon, children, onClick, active }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 
        ${active 
          ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' 
          : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
        }`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </Link>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col">
      
      {/* Global Background Texture (Matching Login Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-[#0a0a0a] to-black opacity-80"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#111]/80 backdrop-blur-md border-b border-neutral-800 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-amber-600 group-hover:text-amber-500 group-hover:border-amber-600/50 transition-colors">
                  <Gavel size={20} />
                </div>
                <span className="text-lg font-serif font-bold tracking-tight text-gray-100 group-hover:text-white transition-colors">
                  AI Debate Judge
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {token ? (
                <>
                  <NavLink 
                    to="/dashboard" 
                    icon={LayoutDashboard} 
                    active={location.pathname === '/dashboard'}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/new-debate" 
                    icon={PlusCircle} 
                    active={location.pathname === '/new-debate'}
                  >
                    New Debate
                  </NavLink>
                  
                  <div className="h-6 w-px bg-neutral-800 mx-2"></div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200 border border-transparent hover:border-red-900/50"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" icon={LogIn}>Login</NavLink>
                  <Link
                    to="/register"
                    className="ml-2 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-700 hover:bg-amber-600 shadow-lg shadow-amber-900/20 transition-all duration-200"
                  >
                    <UserPlus size={16} />
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-neutral-800 bg-[#0a0a0a] overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-2">
                {token ? (
                  <>
                    <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/new-debate" icon={PlusCircle} onClick={() => setMenuOpen(false)}>
                      New Debate
                    </NavLink>
                    <div className="border-t border-neutral-800 my-2 pt-2">
                      <button
                        onClick={() => {
                          logout()
                          setMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-950/20"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" icon={LogIn} onClick={() => setMenuOpen(false)}>
                      Login
                    </NavLink>
                    <NavLink to="/register" icon={UserPlus} onClick={() => setMenuOpen(false)}>
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <motion.main
        key={location.pathname} // Triggers animation on route change
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8"
      >
        <Outlet />
      </motion.main>

      {/* Dark Mode Toast Configuration */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#171717',
            color: '#e5e5e5',
            border: '1px solid #262626',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#d97706', // Amber-600
              secondary: '#fff',
            },
            style: {
              borderLeft: '4px solid #d97706',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              borderLeft: '4px solid #ef4444',
            },
          },
        }}
      />
    </div>
  )
}