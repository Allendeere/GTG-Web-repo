

import React, { useState, useEffect } from 'react'
import { Bell, AlertCircle, Info, CheckCircle, Star, Filter, Search, Mail, Trash2, Clock, Users, Megaphone, Settings, FileText, Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface Notification {
    id: string
    type: 'announcement' | 'task' | 'system' | 'organization' | 'urgent'
    title: string
    message: string
    timestamp: string
    isRead: boolean
    isImportant: boolean
    sender?: string
    actionUrl?: string
    category: string
}

const Notifications: React.FC = () => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    // 模擬通知數據
    useEffect(() => {
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'announcement',
                title: '重要系統維護公告',
                message: '系統將於本週六晚上11點至隔日上午6點進行維護，期間可能無法正常使用。請提前保存您的工作進度。',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                isRead: false,
                isImportant: true,
                sender: '系統管理員',
                category: '系統公告'
            },
            {
                id: '2',
                type: 'task',
                title: '任務更新通知',
                message: '您的任務「微藻培養系統測試」已被標記為完成，請查看詳細報告。',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                isImportant: false,
                sender: '張研究員',
                actionUrl: '/project-tasks',
                category: '任務管理'
            },
            {
                id: '3',
                type: 'organization',
                title: '新成員加入通知',
                message: '李博士已加入農業研究團隊，歡迎新成員的到來！',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                isRead: false,
                isImportant: false,
                sender: '人事部',
                actionUrl: '/organizations',
                category: '組織管理'
            },
            {
                id: '4',
                type: 'urgent',
                title: '緊急物資短缺警報',
                message: '培養液庫存不足，請盡快補充。當前庫存僅剩2天用量。',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                isRead: false,
                isImportant: true,
                sender: '物資管理系統',
                actionUrl: '/supplies',
                category: '物資管理'
            },
            {
                id: '5',
                type: 'system',
                title: '每週工作報告',
                message: '本週您完成了3個任務，參與了2次會議。查看詳細統計報告。',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                isImportant: false,
                sender: '系統自動生成',
                category: '工作報告'
            },
            {
                id: '6',
                type: 'announcement',
                title: '新功能上線通知',
                message: '專案任務管理系統新增了子任務和標籤功能，提升您的工作效率。',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                isImportant: false,
                sender: '產品團隊',
                category: '功能更新'
            }
        ]

        setTimeout(() => {
            setNotifications(mockNotifications)
            setLoading(false)
        }, 1000)
    }, [])

    // 通知類型配置
    const notificationTypes = [
        { value: 'all', label: '全部', icon: Bell, color: 'text-gray-600' },
        { value: 'announcement', label: '公告', icon: Megaphone, color: 'text-blue-600' },
        { value: 'task', label: '任務', icon: CheckCircle, color: 'text-green-600' },
        { value: 'organization', label: '組織', icon: Users, color: 'text-purple-600' },
        { value: 'system', label: '系統', icon: Settings, color: 'text-gray-600' },
        { value: 'urgent', label: '緊急', icon: AlertCircle, color: 'text-red-600' }
    ]

    // 獲取通知圖標
    const getNotificationIcon = (type: string) => {
        const typeConfig = notificationTypes.find(t => t.value === type)
        if (!typeConfig) return Bell
        return typeConfig.icon
    }

    // 獲取通知顏色
    const getNotificationColor = (type: string) => {
        const typeConfig = notificationTypes.find(t => t.value === type)
        return typeConfig?.color || 'text-gray-600'
    }

    // 篩選通知
    const getFilteredNotifications = () => {
        let filtered = notifications

        // 按狀態篩選
        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.isRead)
        } else if (filter === 'important') {
            filtered = filtered.filter(n => n.isImportant)
        }

        // 按類型篩選
        if (typeFilter !== 'all') {
            filtered = filtered.filter(n => n.type === typeFilter)
        }

        // 搜尋篩選
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query) ||
                n.sender?.toLowerCase().includes(query)
            )
        }

        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    // 標記為已讀
    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ))
        toast.success('已標記為已讀')
    }

    // 標記為未讀
    const markAsUnread = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: false } : n
        ))
        toast.success('已標記為未讀')
    }

    // 刪除通知
    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.success('通知已刪除')
    }

    // 標記全部為已讀
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast.success('所有通知已標記為已讀')
    }

    // 格式化時間
    const formatTime = (timestamp: string) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diff = now.getTime() - time.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (days > 0) {
            return `${days}天前`
        } else if (hours > 0) {
            return `${hours}小時前`
        } else {
            return '剛剛'
        }
    }

    const filteredNotifications = getFilteredNotifications()
    const unreadCount = notifications.filter(n => !n.isRead).length

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 標題與統計 */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">通知中心</h1>
                        <p className="text-gray-600">
                            您有 <span className="font-semibold text-blue-600">{unreadCount}</span> 條未讀通知
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            全部標記為已讀
                        </button>
                    )}
                </div>
            </div>

            {/* 篩選控制 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                {/* 搜尋框 */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋通知標題、內容或發送者..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* 篩選按鈕 */}
                <div className="flex flex-wrap gap-3">
                    {/* 狀態篩選 */}
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: '全部' },
                            { value: 'unread', label: '未讀' },
                            { value: 'important', label: '重要' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.value}
                                onClick={() => setFilter(filterOption.value as any)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === filterOption.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>

                    {/* 類型篩選 */}
                    <div className="flex gap-2">
                        {notificationTypes.map((type) => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setTypeFilter(type.value)}
                                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${typeFilter === type.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-1" />
                                    {type.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 通知列表 */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">沒有符合條件的通知</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type)
                        const iconColor = getNotificationColor(notification.type)

                        return (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            {/* 圖標 */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'urgent' ? 'bg-red-100' :
                                                    notification.type === 'announcement' ? 'bg-blue-100' :
                                                        notification.type === 'task' ? 'bg-green-100' :
                                                            notification.type === 'organization' ? 'bg-purple-100' :
                                                                'bg-gray-100'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${iconColor}`} />
                                            </div>

                                            {/* 內容 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className={`font-semibold ${notification.isRead ? 'text-gray-900' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {notification.isImportant && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    )}
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    )}
                                                </div>

                                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatTime(notification.timestamp)}
                                                    </div>
                                                    {notification.sender && (
                                                        <div className="flex items-center">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {notification.sender}
                                                        </div>
                                                    )}
                                                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                        {notification.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 操作按鈕 */}
                                        <div className="flex items-center space-x-2 ml-4">
                                            {notification.actionUrl && (
                                                <a
                                                    href={notification.actionUrl}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    查看詳情
                                                </a>
                                            )}

                                            <button
                                                onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title={notification.isRead ? '標記為未讀' : '標記為已讀'}
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="刪除通知"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Notifications

