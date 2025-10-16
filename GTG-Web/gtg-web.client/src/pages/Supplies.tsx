
import React, { useState, useEffect } from 'react'
import { Package, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock, MapPin, Search, Filter } from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Supply {
    _id: string
    name: string
    category: string
    quantity: number
    unit: string
    expiryDate?: string
    location: {
        warehouse: string
        section: string
        shelf: string
    }
    status: string
    supplier: string
    cost: number
    criticalLevel: number
    createdAt: string
    updatedAt: string
}

const Supplies: React.FC = () => {
    const [supplies, setSupplies] = useState<Supply[]>([])
    const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    const categories = [
        { value: 'food', label: '食品', color: 'bg-green-100 text-green-800' },
        { value: 'water', label: '水源', color: 'bg-blue-100 text-blue-800' },
        { value: 'medicine', label: '醫療', color: 'bg-red-100 text-red-800' },
        { value: 'equipment', label: '設備', color: 'bg-purple-100 text-purple-800' },
        { value: 'seed', label: '種子', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'fertilizer', label: '肥料', color: 'bg-orange-100 text-orange-800' },
        { value: 'emergency', label: '緊急', color: 'bg-red-100 text-red-800' }
    ]

    const statusConfig = {
        available: { label: '可用', icon: CheckCircle, color: 'text-green-600' },
        reserved: { label: '預留', icon: Clock, color: 'text-yellow-600' },
        expired: { label: '過期', icon: AlertTriangle, color: 'text-red-600' },
        damaged: { label: '損壞', icon: AlertTriangle, color: 'text-red-600' },
        in_transit: { label: '運送中', icon: Clock, color: 'text-blue-600' }
    }

    const fetchSupplies = async () => {
        try {
            setLoading(true)
            const response = await lumi.entities.supplies.list({
                sort: { createdAt: -1 }
            })
            setSupplies(response.list || [])
            setFilteredSupplies(response.list || [])
        } catch (error) {
            console.error('Failed to fetch supplies:', error)
            toast.error('載入物資資料失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const supplyData = {
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit') as string,
            expiryDate: formData.get('expiryDate') ? new Date(formData.get('expiryDate') as string).toISOString() : undefined,
            location: {
                warehouse: formData.get('warehouse') as string,
                section: formData.get('section') as string,
                shelf: formData.get('shelf') as string
            },
            status: formData.get('status') as string,
            supplier: formData.get('supplier') as string,
            cost: Number(formData.get('cost')),
            criticalLevel: Number(formData.get('criticalLevel')),
            updatedAt: new Date().toISOString()
        }

        try {
            if (editingSupply) {
                await lumi.entities.supplies.update(editingSupply._id, supplyData)
                toast.success('物資資料更新成功')
            } else {
                await lumi.entities.supplies.create({
                    ...supplyData,
                    createdAt: new Date().toISOString()
                })
                toast.success('新增物資成功')
            }

            setShowForm(false)
            setEditingSupply(null)
            fetchSupplies()
        } catch (error) {
            console.error('Failed to save supply:', error)
            toast.error('儲存物資資料失敗')
        }
    }

    const handleDelete = async (supplyId: string, supplyName: string) => {
        if (!confirm(`確定要刪除物資「${supplyName}」嗎？`)) return

        try {
            await lumi.entities.supplies.delete(supplyId)
            toast.success('物資刪除成功')
            fetchSupplies()
        } catch (error) {
            console.error('Failed to delete supply:', error)
            toast.error('刪除物資失敗')
        }
    }

    const getCategoryLabel = (category: string) => {
        const categoryConfig = categories.find(c => c.value === category)
        return categoryConfig ? categoryConfig.label : category
    }

    const getCategoryColor = (category: string) => {
        const categoryConfig = categories.find(c => c.value === category)
        return categoryConfig ? categoryConfig.color : 'bg-gray-100 text-gray-800'
    }

    const isExpiringSoon = (expiryDate?: string) => {
        if (!expiryDate) return false
        const now = new Date()
        const expiry = new Date(expiryDate)
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }

    const isExpired = (expiryDate?: string) => {
        if (!expiryDate) return false
        return new Date(expiryDate) < new Date()
    }

    const isCriticalStock = (supply: Supply) => {
        return supply.quantity <= supply.criticalLevel
    }

    const filterSupplies = () => {
        let filtered = supplies

        if (searchTerm) {
            filtered = filtered.filter(supply =>
                supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supply.supplier.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedCategory) {
            filtered = filtered.filter(supply => supply.category === selectedCategory)
        }

        if (selectedStatus) {
            filtered = filtered.filter(supply => supply.status === selectedStatus)
        }

        setFilteredSupplies(filtered)
    }

    useEffect(() => {
        fetchSupplies()
    }, [])

    useEffect(() => {
        filterSupplies()
    }, [searchTerm, selectedCategory, selectedStatus, supplies])

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
                    <h1 className="text-3xl font-bold text-gray-900">物資管理</h1>
                    <p className="text-gray-600 mt-1">糧倉統整計算與庫存時效性管理</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSupply(null)
                        setShowForm(true)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>新增物資</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="搜尋物資名稱或供應商..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">所有分類</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">所有狀態</option>
                        {Object.entries(statusConfig).map(([value, config]) => (
                            <option key={value} value={value}>
                                {config.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>共 {filteredSupplies.length} 項物資</span>
                    </div>
                </div>
            </div>

            {/* Supplies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupplies.map((supply) => {
                    const StatusIcon = statusConfig[supply.status as keyof typeof statusConfig]?.icon || Package
                    const critical = isCriticalStock(supply)
                    const expiringSoon = isExpiringSoon(supply.expiryDate)
                    const expired = isExpired(supply.expiryDate)

                    return (
                        <div key={supply._id} className={`bg-white rounded-xl shadow-lg border overflow-hidden ${critical || expired ? 'border-red-200' : expiringSoon ? 'border-yellow-200' : 'border-gray-100'
                            }`}>
                            {/* Header with alerts */}
                            <div className={`p-4 ${critical || expired ? 'bg-red-50' : expiringSoon ? 'bg-yellow-50' : 'bg-gray-50'
                                }`}>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{supply.name}</h3>
                                    <div className="flex items-center space-x-1">
                                        <StatusIcon className={`w-5 h-5 ${statusConfig[supply.status as keyof typeof statusConfig]?.color || 'text-gray-400'}`} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(supply.category)}`}>
                                        {getCategoryLabel(supply.category)}
                                    </span>

                                    {(critical || expiringSoon || expired) && (
                                        <div className="flex space-x-1">
                                            {critical && (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    庫存不足
                                                </span>
                                            )}
                                            {expired && (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    已過期
                                                </span>
                                            )}
                                            {expiringSoon && !expired && (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    即將過期
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">庫存數量</span>
                                    <span className={`font-semibold ${critical ? 'text-red-600' : 'text-gray-900'}`}>
                                        {supply.quantity} {supply.unit}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">警戒值</span>
                                    <span className="text-sm text-gray-900">{supply.criticalLevel} {supply.unit}</span>
                                </div>

                                {supply.expiryDate && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">保存期限</span>
                                        <span className={`text-sm ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-900'}`}>
                                            {format(new Date(supply.expiryDate), 'yyyy/MM/dd')}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-start space-x-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5" />
                                    <span>{supply.location.warehouse} - {supply.location.section} - {supply.location.shelf}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">供應商</span>
                                    <span className="text-sm text-gray-900">{supply.supplier}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">成本</span>
                                    <span className="text-sm text-gray-900">NT$ {supply.cost.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingSupply(supply)
                                        setShowForm(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(supply._id, supply.name)}
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
                                {editingSupply ? '編輯物資' : '新增物資'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        物資名稱 *
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.name || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        分類 *
                                    </label>
                                    <select
                                        name="category"
                                        required
                                        defaultValue={editingSupply?.category || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">請選擇分類</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        數量 *
                                    </label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        min="0"
                                        required
                                        defaultValue={editingSupply?.quantity || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        單位 *
                                    </label>
                                    <input
                                        name="unit"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.unit || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        警戒庫存量 *
                                    </label>
                                    <input
                                        name="criticalLevel"
                                        type="number"
                                        min="0"
                                        required
                                        defaultValue={editingSupply?.criticalLevel || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        倉庫 *
                                    </label>
                                    <input
                                        name="warehouse"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.location.warehouse || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        區域 *
                                    </label>
                                    <input
                                        name="section"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.location.section || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        貨架 *
                                    </label>
                                    <input
                                        name="shelf"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.location.shelf || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        供應商 *
                                    </label>
                                    <input
                                        name="supplier"
                                        type="text"
                                        required
                                        defaultValue={editingSupply?.supplier || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        成本 *
                                    </label>
                                    <input
                                        name="cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        defaultValue={editingSupply?.cost || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        保存期限
                                    </label>
                                    <input
                                        name="expiryDate"
                                        type="date"
                                        defaultValue={editingSupply?.expiryDate ? format(new Date(editingSupply.expiryDate), 'yyyy-MM-dd') : ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        狀態 *
                                    </label>
                                    <select
                                        name="status"
                                        required
                                        defaultValue={editingSupply?.status || 'available'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        {Object.entries(statusConfig).map(([value, config]) => (
                                            <option key={value} value={value}>
                                                {config.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingSupply(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    {editingSupply ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Supplies
