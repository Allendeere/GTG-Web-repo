
import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Package, Zap, Heart, SquareCheck as CheckSquare, AlertTriangle, Target, Calendar, Activity, Settings } from 'lucide-react'
import { lumi } from '../lib/lumi'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

// 註冊 Chart.js 組件
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
)

interface DashboardStats {
    totalTasks: number
    completedTasks: number
    totalSupplies: number
    lowStockSupplies: number
    totalOrganizations: number
    activeModules: number
    weeklyProgress: number
    completionIndex: number
}

interface TaskDistribution {
    completed: number
    inProgress: number
    pending: number
    overdue: number
}

interface ModuleProgress {
    name: string
    progress: number
    status: 'active' | 'inactive' | 'maintenance'
}

interface WeeklyActivity {
    day: string
    tasks: number
    modules: number
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalTasks: 0,
        completedTasks: 0,
        totalSupplies: 0,
        lowStockSupplies: 0,
        totalOrganizations: 0,
        activeModules: 0,
        weeklyProgress: 0,
        completionIndex: 0
    })

    const [taskDistribution, setTaskDistribution] = useState<TaskDistribution>({
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0
    })

    const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([])
    const [loading, setLoading] = useState(true)

    // 載入儀表板數據
    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // 載入任務數據
            const tasksResponse = await lumi.entities.project_tasks.list()
            const tasks = tasksResponse.list || []

            // 載入物資數據
            const suppliesResponse = await lumi.entities.supplies.list()
            const supplies = suppliesResponse.list || []

            // 載入組織數據
            const organizationsResponse = await lumi.entities.organizations.list()
            const organizations = organizationsResponse.list || []

            // 載入機器模塊數據
            const modulesResponse = await lumi.entities.machine_modules.list()
            const modules = modulesResponse.list || []

            // 計算任務統計
            const completedTasks = tasks.filter(task => task.completed).length
            const totalTasks = tasks.length

            // 計算任務分布
            const now = new Date()
            const taskDist = {
                completed: completedTasks,
                inProgress: tasks.filter(task => !task.completed && task.parentId).length,
                pending: tasks.filter(task => !task.completed && !task.parentId).length,
                overdue: tasks.filter(task => {
                    if (task.completed) return false
                    const createdDate = new Date(task.createdAt)
                    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
                    return daysDiff > 7 // 超過7天未完成視為逾期
                }).length
            }

            // 計算物資統計
            const lowStockSupplies = supplies.filter(supply => {
                const quantity = parseInt(supply.quantity) || 0
                return quantity < 10 // 數量少於10視為庫存不足
            }).length

            // 計算機器模塊進度
            const moduleProgressData = modules.map(module => ({
                name: module.name,
                progress: Math.min(100, Math.max(0, parseInt(module.progress) || 0)),
                status: module.status === 'active' ? 'active' as const :
                    module.status === 'maintenance' ? 'maintenance' as const : 'inactive' as const
            }))

            // 計算本周活動數據
            const weekDays = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
            const weeklyData = weekDays.map((day, index) => {
                // 模擬一週的活動數據，實際應用中可以根據真實的時間戳計算
                const taskCount = Math.floor(Math.random() * 10) + 1
                const moduleCount = Math.floor(Math.random() * 5) + 1
                return {
                    day,
                    tasks: taskCount,
                    modules: moduleCount
                }
            })

            // 計算本周進度和完成指數
            const weeklyProgress = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)
            const activeModulesCount = modules.filter(m => m.status === 'active').length
            const completionIndex = Math.round(
                (weeklyProgress * 0.6 + (activeModulesCount / Math.max(modules.length, 1)) * 100 * 0.4)
            )

            // 更新狀態
            setStats({
                totalTasks,
                completedTasks,
                totalSupplies: supplies.length,
                lowStockSupplies,
                totalOrganizations: organizations.length,
                activeModules: activeModulesCount,
                weeklyProgress,
                completionIndex
            })

            setTaskDistribution(taskDist)
            setModuleProgress(moduleProgressData)
            setWeeklyActivity(weeklyData)

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // 圖表配置
    const taskDistributionChartData = {
        labels: ['已完成', '進行中', '待處理', '逾期'],
        datasets: [
            {
                data: [
                    taskDistribution.completed,
                    taskDistribution.inProgress,
                    taskDistribution.pending,
                    taskDistribution.overdue
                ],
                backgroundColor: [
                    '#10b981', // green-500
                    '#3b82f6', // blue-500
                    '#f59e0b', // yellow-500
                    '#ef4444'  // red-500
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    }

    const moduleProgressChartData = {
        labels: moduleProgress.map(m => m.name),
        datasets: [
            {
                label: '開發進度 (%)',
                data: moduleProgress.map(m => m.progress),
                backgroundColor: moduleProgress.map(m =>
                    m.status === 'active' ? '#10b981' :
                        m.status === 'maintenance' ? '#f59e0b' : '#6b7280'
                ),
                borderColor: moduleProgress.map(m =>
                    m.status === 'active' ? '#059669' :
                        m.status === 'maintenance' ? '#d97706' : '#4b5563'
                ),
                borderWidth: 1
            }
        ]
    }

    const weeklyActivityChartData = {
        labels: weeklyActivity.map(a => a.day),
        datasets: [
            {
                label: '任務數量',
                data: weeklyActivity.map(a => a.tasks),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: '模塊活動',
                data: weeklyActivity.map(a => a.modules),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            }
        }
    }

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">GTG計畫 - 智能農業儀表板</h1>
                <p className="text-gray-600">微藻共生池與應急糧食系統監控中心</p>
            </div>

            {/* 主要統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">專案任務</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}/{stats.totalTasks}</p>
                            <p className="text-xs text-green-600">
                                完成率 {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                            </p>
                        </div>
                        <CheckSquare className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">物資庫存</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSupplies}</p>
                            <p className="text-xs text-red-600">
                                {stats.lowStockSupplies} 項庫存不足
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">組織團隊</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                            <p className="text-xs text-blue-600">活躍組織</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">機器模塊</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeModules}</p>
                            <p className="text-xs text-green-600">運行中</p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* 圖表區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 任務分布圓餅圖 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        任務分布狀態
                    </h3>
                    <div className="h-64">
                        <Doughnut data={taskDistributionChartData} options={chartOptions} />
                    </div>
                </div>

                {/* 機器模塊進度長條圖 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        機器模塊開發進度
                    </h3>
                    <div className="h-64">
                        {moduleProgress.length > 0 ? (
                            <Bar data={moduleProgressChartData} options={barChartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                暫無模塊數據
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 底部指標 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 本周動量折線圖 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                        本周動量趨勢
                    </h3>
                    <div className="h-64">
                        <Line data={weeklyActivityChartData} options={chartOptions} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">本周進度</span>
                            <span className="text-lg font-bold text-green-600">{stats.weeklyProgress}%</span>
                        </div>
                    </div>
                </div>

                {/* 當前完成指數 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-red-600" />
                        當前完成指數
                    </h3>

                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.completionIndex / 100)}`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">{stats.completionIndex}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">任務完成度</span>
                                <span className="font-medium">{Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">模塊運行率</span>
                                <span className="font-medium">{Math.round((stats.activeModules / Math.max(moduleProgress.length, 1)) * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">整體健康度</span>
                                <span className={`font-medium ${stats.completionIndex >= 80 ? 'text-green-600' :
                                        stats.completionIndex >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {stats.completionIndex >= 80 ? '優秀' :
                                        stats.completionIndex >= 60 ? '良好' : '需改善'}
                                </span>
                            </div>
                        </div>

                        {/* 詳細統計圖表 */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 relative">
                                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                                            <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                            <circle
                                                cx="30" cy="30" r="25" fill="none" stroke="#3b82f6" strokeWidth="4"
                                                strokeDasharray={`${2 * Math.PI * 25}`}
                                                strokeDashoffset={`${2 * Math.PI * 25 * (1 - (stats.completedTasks / Math.max(stats.totalTasks, 1)))}`}
                                                className="transition-all duration-500"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-600">
                                                {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">任務進度</p>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 relative">
                                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                                            <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                            <circle
                                                cx="30" cy="30" r="25" fill="none" stroke="#f59e0b" strokeWidth="4"
                                                strokeDasharray={`${2 * Math.PI * 25}`}
                                                strokeDashoffset={`${2 * Math.PI * 25 * (1 - (stats.activeModules / Math.max(moduleProgress.length, 1)))}`}
                                                className="transition-all duration-500"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-yellow-600">
                                                {Math.round((stats.activeModules / Math.max(moduleProgress.length, 1)) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">模塊運行</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 精神支持提醒 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-6">
                <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-pink-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">今日精神支持</h3>
                </div>
                <p className="text-gray-700 mb-2">
                    「凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。」- 馬太福音 11:28
                </p>
                <p className="text-sm text-gray-600">
                    在忙碌的專案工作中，記得適時休息，依靠信仰的力量前進。
                </p>
            </div>
        </div>
    )
}

export default Dashboard
