
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Package, Cpu, Heart, SquareCheck as CheckSquare, Menu, X, Sprout, Eye, LogOut, User, Crown, Settings, Bell } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationCount] = useState(3) // 模擬未讀通知數量
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAdmin, signOut } = useAuth()

    const navigation = [
        { name: '總覽儀表板', href: '/', icon: Home, adminOnly: false },
        { name: '計畫簡介', href: '/overview', icon: Eye, adminOnly: false },
        { name: '組織管理', href: '/organizations', icon: Users, adminOnly: false },
        { name: '物資管理', href: '/supplies', icon: Package, adminOnly: false },
        { name: '機器模塊', href: '/machine-modules', icon: Cpu, adminOnly: false },
        { name: '精神支持', href: '/spiritual-support', icon: Heart, adminOnly: false },
        { name: '專案任務', href: '/project-tasks', icon: CheckSquare, adminOnly: false },
    ]

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success('已成功登出')
        } catch (error) {
            toast.error('登出失敗')
        }
    }

    const filteredNavigation = navigation.filter(item =>
        !item.adminOnly || (item.adminOnly && isAdmin)
    )

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col`}>

                {/* Header */}
                <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex-shrink-0 relative overflow-hidden">
                    {/* 背景裝飾 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"></div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>

                    <div className="flex items-center space-x-3 relative z-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-xl font-bold tracking-tight">GTG計畫</h1>
                            <p className="text-xs text-emerald-100 font-medium">智能農業危機應對</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors relative z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isAdmin
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                            }`}>
                            {isAdmin ? (
                                <Crown className="w-5 h-5 text-white" />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.userName}
                            </p>
                            <p className={`text-xs font-medium ${isAdmin ? 'text-amber-600' : 'text-blue-600'
                                }`}>
                                {isAdmin ? '系統管理員' : '一般用戶'}
                            </p>
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-4 h-4" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-2 px-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {filteredNavigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transform scale-105'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 hover:text-gray-900 hover:scale-102'
                                            }`}
                                    >
                                        <div className={`mr-3 p-1 rounded-lg transition-colors ${isActive
                                                ? 'bg-white/20'
                                                : 'group-hover:bg-white/50'
                                            }`}>
                                            <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                                                }`} />
                                        </div>
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md group"
                    >
                        <LogOut className="w-4 h-4 mr-2 text-gray-500 group-hover:text-red-500 transition-colors" />
                        登出系統
                    </button>

                    <div className="text-xs text-gray-500 text-center mt-3 space-y-1">
                        <p>微藻共生池與應急糧食系統</p>
                        <p className="font-medium">© 2025 GTG Project</p>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Top bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-white/20 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 flex-shrink-0">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <div className="text-sm text-gray-600 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-200">
                                {new Date().toLocaleDateString('zh-TW', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                })}
                            </div>
                        </div>

                        {/* 右側狀態指示器 */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>系統正常</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
