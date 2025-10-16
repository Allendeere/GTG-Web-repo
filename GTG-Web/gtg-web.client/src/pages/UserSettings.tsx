
import React, { useState, useRef } from 'react'
import { User, Camera, Mail, Lock, Bell, Shield, Save, X, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface UserProfile {
    userName: string
    email: string
    avatar?: string
    phoneNumber?: string
    department?: string
    bio?: string
}

interface NotificationSettings {
    emailNotifications: boolean
    pushNotifications: boolean
    taskUpdates: boolean
    systemAnnouncements: boolean
    weeklyReports: boolean
}

const UserSettings: React.FC = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')
    const [loading, setLoading] = useState(false)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 個人資料狀態
    const [profile, setProfile] = useState<UserProfile>({
        userName: user?.userName || '',
        email: user?.email || '',
        avatar: '',
        phoneNumber: '',
        department: '',
        bio: ''
    })

    // 密碼修改狀態
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // 通知設定狀態
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        pushNotifications: true,
        taskUpdates: true,
        systemAnnouncements: true,
        weeklyReports: false
    })

    // 頭像上傳
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        try {
            setAvatarUploading(true)
            const results = await lumi.tools.file.upload(Array.from(files))

            if (results[0]?.fileUrl) {
                setProfile(prev => ({ ...prev, avatar: results[0].fileUrl || '' }))
                toast.success('頭像上傳成功')
            } else if (results[0]?.uploadError) {
                toast.error(`上傳失敗: ${results[0].uploadError}`)
            }
        } catch (error) {
            console.error('Avatar upload failed:', error)
            toast.error('頭像上傳失敗')
        } finally {
            setAvatarUploading(false)
        }
    }

    // 保存個人資料
    const handleSaveProfile = async () => {
        try {
            setLoading(true)
            // 這裡應該調用API更新用戶資料
            // await lumi.entities.users.update(user.userId, profile)

            // 模擬API調用
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast.success('個人資料更新成功')
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('更新失敗')
        } finally {
            setLoading(false)
        }
    }

    // 修改密碼
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('新密碼與確認密碼不符')
            return
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('新密碼至少需要8個字符')
            return
        }

        try {
            setLoading(true)
            // 這裡應該調用API修改密碼
            // await lumi.auth.changePassword(passwordData.currentPassword, passwordData.newPassword)

            // 模擬API調用
            await new Promise(resolve => setTimeout(resolve, 1000))

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            toast.success('密碼修改成功')
        } catch (error) {
            console.error('Failed to change password:', error)
            toast.error('密碼修改失敗')
        } finally {
            setLoading(false)
        }
    }

    // 保存通知設定
    const handleSaveNotifications = async () => {
        try {
            setLoading(true)
            // 這裡應該調用API保存通知設定
            // await lumi.entities.user_settings.update(user.userId, { notifications: notificationSettings })

            // 模擬API調用
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast.success('通知設定已保存')
        } catch (error) {
            console.error('Failed to save notification settings:', error)
            toast.error('保存失敗')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', name: '個人資料', icon: User },
        { id: 'security', name: '安全設定', icon: Shield },
        { id: 'notifications', name: '通知設定', icon: Bell }
    ]

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 標題 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">用戶設定</h1>
                <p className="text-gray-600">管理您的個人資料、安全設定和通知偏好</p>
            </div>

            {/* 標籤頁導航 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-2" />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* 個人資料標籤頁 */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* 頭像上傳 */}
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-white" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarUploading}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {avatarUploading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{user?.userName}</h3>
                                    <p className="text-sm text-gray-500">{user?.userRole === 'ADMIN' ? '系統管理員' : '一般用戶'}</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        更換頭像
                                    </button>
                                </div>
                            </div>

                            {/* 基本資料表單 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">用戶名稱</label>
                                    <input
                                        type="text"
                                        value={profile.userName}
                                        onChange={(e) => setProfile(prev => ({ ...prev, userName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">電話號碼</label>
                                    <input
                                        type="tel"
                                        value={profile.phoneNumber}
                                        onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="選填"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
                                    <input
                                        type="text"
                                        value={profile.department}
                                        onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="選填"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">個人簡介</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="簡單介紹一下自己..."
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    保存更改
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 安全設定標籤頁 */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">修改密碼</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">目前密碼</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">新密碼</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">至少8個字符</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">確認新密碼</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Lock className="w-4 h-4 mr-2" />
                                        )}
                                        修改密碼
                                    </button>
                                </div>
                            </div>

                            {/* 安全資訊 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">帳戶安全資訊</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <span>帳戶已通過電子郵件驗證</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <span>使用安全的 Lumi 認證系統</span>
                                    </div>
                                    <div className="flex items-center">
                                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                                        <span>建議定期更換密碼以確保安全</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 通知設定標籤頁 */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">通知偏好設定</h3>
                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', label: '電子郵件通知', description: '接收重要更新的電子郵件' },
                                        { key: 'pushNotifications', label: '推播通知', description: '瀏覽器推播通知' },
                                        { key: 'taskUpdates', label: '任務更新', description: '當任務狀態改變時通知我' },
                                        { key: 'systemAnnouncements', label: '系統公告', description: '接收系統重要公告' },
                                        { key: 'weeklyReports', label: '週報摘要', description: '每週接收工作摘要報告' }
                                    ].map((setting) => (
                                        <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                                                <p className="text-sm text-gray-500">{setting.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings[setting.key as keyof NotificationSettings]}
                                                    onChange={(e) => setNotificationSettings(prev => ({
                                                        ...prev,
                                                        [setting.key]: e.target.checked
                                                    }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveNotifications}
                                        disabled={loading}
                                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        保存設定
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserSettings
