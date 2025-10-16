
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Shield, Lock, User, Crown, Sparkles } from 'lucide-react'

interface AuthGuardProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated, isAdmin, loading, signIn } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">載入中...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* 登入卡片 */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        {/* Logo 區域 */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">GTG計畫</h1>
                            <p className="text-gray-600">智能農業危機應對平台</p>
                        </div>

                        {/* 登入按鈕 */}
                        <button
                            onClick={signIn}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                            <Lock className="w-5 h-5" />
                            <span>登入系統</span>
                        </button>

                        {/* 功能說明 */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                                平台功能
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                                    組織與團隊管理
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                                    物資供應鏈追蹤
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                                    智能設備監控
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    專案任務協作
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 底部說明 */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        請使用您的帳戶登入以存取平台功能
                    </p>
                </div>
            </div>
        )
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">權限不足</h2>
                        <p className="text-gray-600 mb-6">此功能需要管理員權限才能存取</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                                <User className="w-4 h-4" />
                                <span>當前角色: {user?.userRole}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default AuthGuard
