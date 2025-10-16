
import React, { useState, useEffect } from 'react'
import { Heart, Plus, Edit, Trash2, BookOpen, Users, MessageCircleDashed as MessageCircle, Star, Eye, Search, Filter } from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface SpiritualSupport {
    _id: string
    title: string
    type: string
    content: string
    category: string
    reference?: string
    tags: string[]
    isActive: boolean
    viewCount: number
    createdAt: string
    updatedAt: string
}

const SpiritualSupport: React.FC = () => {
    const [supports, setSupports] = useState<SpiritualSupport[]>([])
    const [filteredSupports, setFilteredSupports] = useState<SpiritualSupport[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSupport, setEditingSupport] = useState<SpiritualSupport | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    const supportTypes = [
        { value: 'scripture', label: '聖經經文', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
        { value: 'prayer', label: '禱告詞', icon: Heart, color: 'bg-purple-100 text-purple-800' },
        { value: 'community_activity', label: '社區活動', icon: Users, color: 'bg-green-100 text-green-800' },
        { value: 'counseling', label: '心理輔導', icon: MessageCircle, color: 'bg-orange-100 text-orange-800' },
        { value: 'encouragement', label: '鼓勵話語', icon: Star, color: 'bg-yellow-100 text-yellow-800' }
    ]

    const categories = [
        { value: 'hope', label: '盼望', color: 'bg-blue-50 border-blue-200' },
        { value: 'courage', label: '勇氣', color: 'bg-red-50 border-red-200' },
        { value: 'peace', label: '平安', color: 'bg-green-50 border-green-200' },
        { value: 'strength', label: '力量', color: 'bg-purple-50 border-purple-200' },
        { value: 'guidance', label: '引導', color: 'bg-yellow-50 border-yellow-200' },
        { value: 'comfort', label: '安慰', color: 'bg-pink-50 border-pink-200' }
    ]

    const fetchSupports = async () => {
        try {
            setLoading(true)
            const response = await lumi.entities.spiritual_support.list({
                sort: { createdAt: -1 }
            })
            setSupports(response.list || [])
            setFilteredSupports(response.list || [])
        } catch (error) {
            console.error('Failed to fetch spiritual supports:', error)
            toast.error('載入精神支持資料失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const tags = (formData.get('tags') as string)
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)

        const supportData = {
            title: formData.get('title') as string,
            type: formData.get('type') as string,
            content: formData.get('content') as string,
            category: formData.get('category') as string,
            reference: formData.get('reference') as string || undefined,
            tags,
            isActive: formData.get('isActive') === 'true',
            viewCount: editingSupport?.viewCount || 0,
            updatedAt: new Date().toISOString()
        }

        try {
            if (editingSupport) {
                await lumi.entities.spiritual_support.update(editingSupport._id, supportData)
                toast.success('精神支持內容更新成功')
            } else {
                await lumi.entities.spiritual_support.create({
                    ...supportData,
                    createdAt: new Date().toISOString()
                })
                toast.success('新增精神支持內容成功')
            }

            setShowForm(false)
            setEditingSupport(null)
            fetchSupports()
        } catch (error) {
            console.error('Failed to save spiritual support:', error)
            toast.error('儲存精神支持內容失敗')
        }
    }

    const handleDelete = async (supportId: string, supportTitle: string) => {
        if (!confirm(`確定要刪除「${supportTitle}」嗎？`)) return

        try {
            await lumi.entities.spiritual_support.delete(supportId)
            toast.success('精神支持內容刪除成功')
            fetchSupports()
        } catch (error) {
            console.error('Failed to delete spiritual support:', error)
            toast.error('刪除精神支持內容失敗')
        }
    }

    const incrementViewCount = async (support: SpiritualSupport) => {
        try {
            await lumi.entities.spiritual_support.update(support._id, {
                viewCount: support.viewCount + 1
            })
            // Update local state
            setSupports(prev => prev.map(s =>
                s._id === support._id ? { ...s, viewCount: s.viewCount + 1 } : s
            ))
            setFilteredSupports(prev => prev.map(s =>
                s._id === support._id ? { ...s, viewCount: s.viewCount + 1 } : s
            ))
        } catch (error) {
            console.error('Failed to update view count:', error)
        }
    }

    const getTypeConfig = (type: string) => {
        return supportTypes.find(t => t.value === type) || {
            value: type,
            label: type,
            icon: Heart,
            color: 'bg-gray-100 text-gray-800'
        }
    }

    const getCategoryConfig = (category: string) => {
        return categories.find(c => c.value === category) || {
            value: category,
            label: category,
            color: 'bg-gray-50 border-gray-200'
        }
    }

    const filterSupports = () => {
        let filtered = supports

        if (searchTerm) {
            filtered = filtered.filter(support =>
                support.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                support.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                support.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (selectedType) {
            filtered = filtered.filter(support => support.type === selectedType)
        }

        if (selectedCategory) {
            filtered = filtered.filter(support => support.category === selectedCategory)
        }

        // Only show active supports for regular viewing
        filtered = filtered.filter(support => support.isActive)

        setFilteredSupports(filtered)
    }

    useEffect(() => {
        fetchSupports()
    }, [])

    useEffect(() => {
        filterSupports()
    }, [searchTerm, selectedType, selectedCategory, supports])

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
                    <h1 className="text-3xl font-bold text-gray-900">精神支持系統</h1>
                    <p className="text-gray-600 mt-1">社區支持系統與基督教聖經經文安撫</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSupport(null)
                        setShowForm(true)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>新增內容</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="搜尋標題、內容或標籤..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">所有類型</option>
                        {supportTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">所有主題</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>共 {filteredSupports.length} 項內容</span>
                    </div>
                </div>
            </div>

            {/* Support Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupports.map((support) => {
                    const typeConfig = getTypeConfig(support.type)
                    const categoryConfig = getCategoryConfig(support.category)
                    const TypeIcon = typeConfig.icon

                    return (
                        <div
                            key={support._id}
                            className={`bg-white rounded-xl shadow-lg border-2 ${categoryConfig.color} overflow-hidden cursor-pointer hover:shadow-xl transition-shadow`}
                            onClick={() => incrementViewCount(support)}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('-800', '-200')}`}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{support.title}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color}`}>
                                        {typeConfig.label}
                                    </span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800`}>
                                        {categoryConfig.label}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-700 text-sm line-clamp-4 mb-4 leading-relaxed">
                                    {support.content}
                                </p>

                                {support.reference && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs font-medium text-blue-800 mb-1">聖經出處</p>
                                        <p className="text-sm text-blue-700">{support.reference}</p>
                                    </div>
                                )}

                                {support.tags && support.tags.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {support.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Eye className="w-3 h-3" />
                                        <span>{support.viewCount} 次瀏覽</span>
                                    </div>
                                    <span>{new Date(support.createdAt).toLocaleDateString('zh-TW')}</span>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingSupport(support)
                                        setShowForm(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(support._id, support.title)
                                    }}
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
                                {editingSupport ? '編輯精神支持內容' : '新增精神支持內容'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    標題 *
                                </label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    defaultValue={editingSupport?.title || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        類型 *
                                    </label>
                                    <select
                                        name="type"
                                        required
                                        defaultValue={editingSupport?.type || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">請選擇類型</option>
                                        {supportTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        主題分類 *
                                    </label>
                                    <select
                                        name="category"
                                        required
                                        defaultValue={editingSupport?.category || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">請選擇主題</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    內容 *
                                </label>
                                <textarea
                                    name="content"
                                    required
                                    rows={6}
                                    defaultValue={editingSupport?.content || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    聖經經文出處
                                </label>
                                <input
                                    name="reference"
                                    type="text"
                                    defaultValue={editingSupport?.reference || ''}
                                    placeholder="例如：詩篇 23:1-2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    標籤 (用逗號分隔)
                                </label>
                                <input
                                    name="tags"
                                    type="text"
                                    defaultValue={editingSupport?.tags?.join(', ') || ''}
                                    placeholder="例如：盼望, 平安, 安慰"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    狀態 *
                                </label>
                                <select
                                    name="isActive"
                                    required
                                    defaultValue={editingSupport?.isActive?.toString() || 'true'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="true">啟用</option>
                                    <option value="false">停用</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingSupport(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    {editingSupport ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SpiritualSupport
