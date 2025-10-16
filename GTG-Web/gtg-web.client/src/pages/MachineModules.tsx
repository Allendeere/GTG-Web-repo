
import React, { useState, useEffect } from 'react'
import { Cpu, Plus, Edit, Trash2, Users, Calendar, Target, Zap, Eye, Volume2, Thermometer, Lightbulb, Droplets, Microscope } from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface MachineModule {
    _id: string
    name: string
    type: string
    description: string
    status: string
    progress: number
    assignedTo: string
    team: string[]
    specifications: Record<string, any>
    dependencies: string[]
    estimatedCompletion: string
    actualCompletion?: string
    createdAt: string
    updatedAt: string
}

const MachineModules: React.FC = () => {
    const [modules, setModules] = useState<MachineModule[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingModule, setEditingModule] = useState<MachineModule | null>(null)

    const moduleTypes = [
        { value: 'lighting', label: '照明系統', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
        { value: 'power', label: '電力管理', icon: Zap, color: 'bg-blue-100 text-blue-800' },
        { value: 'ai_vision', label: 'AI與影像', icon: Eye, color: 'bg-purple-100 text-purple-800' },
        { value: 'sound_wave', label: '聲波系統', icon: Volume2, color: 'bg-green-100 text-green-800' },
        { value: 'electric_stimulation', label: '電刺激', icon: Zap, color: 'bg-red-100 text-red-800' },
        { value: 'temperature_control', label: '恆溫控制', icon: Thermometer, color: 'bg-orange-100 text-orange-800' },
        { value: 'dual_flow', label: '氣液態雙導流', icon: Droplets, color: 'bg-cyan-100 text-cyan-800' },
        { value: 'plant_research', label: '植物理論研究', icon: Microscope, color: 'bg-emerald-100 text-emerald-800' }
    ]

    const statusConfig = {
        planning: { label: '規劃中', color: 'bg-gray-100 text-gray-800' },
        development: { label: '開發中', color: 'bg-blue-100 text-blue-800' },
        testing: { label: '測試中', color: 'bg-yellow-100 text-yellow-800' },
        completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
        suspended: { label: '暫停', color: 'bg-red-100 text-red-800' }
    }

    const fetchModules = async () => {
        try {
            setLoading(true)
            const response = await lumi.entities.machine_modules.list({
                sort: { createdAt: -1 }
            })
            setModules(response.list || [])
        } catch (error) {
            console.error('Failed to fetch modules:', error)
            toast.error('載入模塊資料失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const team = (formData.get('team') as string)
            .split(',')
            .map(member => member.trim())
            .filter(member => member.length > 0)

        const dependencies = (formData.get('dependencies') as string)
            .split(',')
            .map(dep => dep.trim())
            .filter(dep => dep.length > 0)

        const moduleData = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as string,
            progress: Number(formData.get('progress')),
            assignedTo: formData.get('assignedTo') as string,
            team,
            specifications: {
                power: formData.get('specPower') as string,
                efficiency: formData.get('specEfficiency') as string,
                notes: formData.get('specNotes') as string
            },
            dependencies,
            estimatedCompletion: formData.get('estimatedCompletion') ?
                new Date(formData.get('estimatedCompletion') as string).toISOString() :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        try {
            if (editingModule) {
                await lumi.entities.machine_modules.update(editingModule._id, moduleData)
                toast.success('模塊資料更新成功')
            } else {
                await lumi.entities.machine_modules.create({
                    ...moduleData,
                    createdAt: new Date().toISOString()
                })
                toast.success('新增模塊成功')
            }

            setShowForm(false)
            setEditingModule(null)
            fetchModules()
        } catch (error) {
            console.error('Failed to save module:', error)
            toast.error('儲存模塊資料失敗')
        }
    }

    const handleDelete = async (moduleId: string, moduleName: string) => {
        if (!confirm(`確定要刪除模塊「${moduleName}」嗎？`)) return

        try {
            await lumi.entities.machine_modules.delete(moduleId)
            toast.success('模塊刪除成功')
            fetchModules()
        } catch (error) {
            console.error('Failed to delete module:', error)
            toast.error('刪除模塊失敗')
        }
    }

    const getTypeConfig = (type: string) => {
        return moduleTypes.find(t => t.value === type) || {
            value: type,
            label: type,
            icon: Cpu,
            color: 'bg-gray-100 text-gray-800'
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 90) return 'bg-green-500'
        if (progress >= 70) return 'bg-blue-500'
        if (progress >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    useEffect(() => {
        fetchModules()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">機器模塊開發</h1>
                    <p className="text-gray-600 mt-1">快速生產機器開發進度與模塊分工管理</p>
                </div>
                <button
                    onClick={() => {
                        setEditingModule(null)
                        setShowForm(true)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>新增模塊</span>
                </button>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">整體開發進度</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count = modules.filter(m => m.status === status).length
                        return (
                            <div key={status} className="text-center">
                                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${config.color} mb-2`}>
                                    {config.label}
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className="text-xs text-gray-500">個模塊</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modules.map((module) => {
                    const typeConfig = getTypeConfig(module.type)
                    const TypeIcon = typeConfig.icon

                    return (
                        <div key={module._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('-800', '-200')}`}>
                                            <TypeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[module.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
                                        {statusConfig[module.status as keyof typeof statusConfig]?.label || module.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600">{module.description}</p>
                            </div>

                            {/* Progress */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">開發進度</span>
                                    <span className="text-sm font-bold text-gray-900">{module.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getProgressColor(module.progress)}`}
                                        style={{ width: `${module.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-6 space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">負責人：</span>
                                    <span className="font-medium text-gray-900">{module.assignedTo}</span>
                                </div>

                                {module.team && module.team.length > 0 && (
                                    <div className="flex items-start space-x-3 text-sm">
                                        <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-gray-600">團隊成員：</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {module.team.map((member, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                    >
                                                        {member}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 text-sm">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">預計完成：</span>
                                    <span className="text-gray-900">
                                        {format(new Date(module.estimatedCompletion), 'yyyy/MM/dd')}
                                    </span>
                                </div>

                                {/* Specifications */}
                                {module.specifications && Object.keys(module.specifications).length > 0 && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">技術規格</p>
                                        <div className="space-y-1">
                                            {Object.entries(module.specifications).map(([key, value]) => (
                                                value && (
                                                    <div key={key} className="flex justify-between text-xs">
                                                        <span className="text-gray-600 capitalize">{key}:</span>
                                                        <span className="text-gray-900">{value}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Dependencies */}
                                {module.dependencies && module.dependencies.length > 0 && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">依賴模塊</p>
                                        <div className="flex flex-wrap gap-1">
                                            {module.dependencies.map((dep, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                                >
                                                    {dep}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingModule(module)
                                        setShowForm(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(module._id, module.name)}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingModule ? '編輯模塊' : '新增模塊'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        模塊名稱 *
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        defaultValue={editingModule?.name || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        模塊類型 *
                                    </label>
                                    <select
                                        name="type"
                                        required
                                        defaultValue={editingModule?.type || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">請選擇類型</option>
                                        {moduleTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    模塊描述 *
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    defaultValue={editingModule?.description || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        狀態 *
                                    </label>
                                    <select
                                        name="status"
                                        required
                                        defaultValue={editingModule?.status || 'planning'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {Object.entries(statusConfig).map(([value, config]) => (
                                            <option key={value} value={value}>
                                                {config.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        進度 (%) *
                                    </label>
                                    <input
                                        name="progress"
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        defaultValue={editingModule?.progress || 0}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        預計完成日期 *
                                    </label>
                                    <input
                                        name="estimatedCompletion"
                                        type="date"
                                        required
                                        defaultValue={editingModule?.estimatedCompletion ? format(new Date(editingModule.estimatedCompletion), 'yyyy-MM-dd') : ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        負責人 *
                                    </label>
                                    <input
                                        name="assignedTo"
                                        type="text"
                                        required
                                        defaultValue={editingModule?.assignedTo || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        團隊成員 (用逗號分隔)
                                    </label>
                                    <input
                                        name="team"
                                        type="text"
                                        defaultValue={editingModule?.team?.join(', ') || ''}
                                        placeholder="例如：張工程師, 李技師, 王助理"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    依賴模塊 (用逗號分隔)
                                </label>
                                <input
                                    name="dependencies"
                                    type="text"
                                    defaultValue={editingModule?.dependencies?.join(', ') || ''}
                                    placeholder="例如：電力管理, 控制系統"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">技術規格</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">功率</label>
                                        <input
                                            name="specPower"
                                            type="text"
                                            defaultValue={editingModule?.specifications?.power || ''}
                                            placeholder="例如：100W"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">效率</label>
                                        <input
                                            name="specEfficiency"
                                            type="text"
                                            defaultValue={editingModule?.specifications?.efficiency || ''}
                                            placeholder="例如：85%"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">備註</label>
                                        <input
                                            name="specNotes"
                                            type="text"
                                            defaultValue={editingModule?.specifications?.notes || ''}
                                            placeholder="其他規格說明"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingModule(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    {editingModule ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MachineModules
