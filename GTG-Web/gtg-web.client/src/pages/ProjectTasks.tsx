
import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Link, Tag, SquareCheck as CheckSquare, Square, ChevronDown, ChevronRight, X, Save, Hash, Search, FileText, ExternalLink, Image, Video, File, Users, Lightbulb, Heart, Settings, Bookmark, Filter, Building, Zap, Cpu, Globe, Shield, Target, Award, Briefcase, Home, Star } from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface TodoItem {
    _id?: string
    title: string
    description: string
    completed: boolean
    tags: string[]
    parentId?: string
    linkedTodos: string[]
    createdAt: string
    updatedAt: string
}

interface ReferenceItem {
    _id?: string
    title: string
    description: string
    content: string
    type: 'link' | 'note' | 'image' | 'video' | 'file' | 'research'
    url?: string
    tags: string[]
    organization: string
    author: string
    isPublic: boolean
    bookmarked: boolean
    createdAt: string
    updatedAt: string
}

interface TagStats {
    name: string
    count: number
    percentage: number
}

interface OrganizationType {
    id: string
    name: string
    icon: string
    color: string
}

// 可選的圖標列表
const availableIcons = [
    { name: 'Heart', icon: Heart, label: '愛心' },
    { name: 'Settings', icon: Settings, label: '設定' },
    { name: 'Users', icon: Users, label: '用戶' },
    { name: 'Lightbulb', icon: Lightbulb, label: '燈泡' },
    { name: 'FileText', icon: FileText, label: '文件' },
    { name: 'Building', icon: Building, label: '建築' },
    { name: 'Zap', icon: Zap, label: '閃電' },
    { name: 'Cpu', icon: Cpu, label: '處理器' },
    { name: 'Globe', icon: Globe, label: '地球' },
    { name: 'Shield', icon: Shield, label: '盾牌' },
    { name: 'Target', icon: Target, label: '目標' },
    { name: 'Award', icon: Award, label: '獎章' },
    { name: 'Briefcase', icon: Briefcase, label: '公事包' },
    { name: 'Home', icon: Home, label: '家' },
    { name: 'Star', icon: Star, label: '星星' }
]

// 可選的顏色
const availableColors = [
    { value: 'bg-pink-100 text-pink-800', label: '粉紅色', preview: 'bg-pink-200' },
    { value: 'bg-blue-100 text-blue-800', label: '藍色', preview: 'bg-blue-200' },
    { value: 'bg-green-100 text-green-800', label: '綠色', preview: 'bg-green-200' },
    { value: 'bg-yellow-100 text-yellow-800', label: '黃色', preview: 'bg-yellow-200' },
    { value: 'bg-purple-100 text-purple-800', label: '紫色', preview: 'bg-purple-200' },
    { value: 'bg-red-100 text-red-800', label: '紅色', preview: 'bg-red-200' },
    { value: 'bg-indigo-100 text-indigo-800', label: '靛色', preview: 'bg-indigo-200' },
    { value: 'bg-gray-100 text-gray-800', label: '灰色', preview: 'bg-gray-200' }
]

const referenceTypes = [
    { value: 'link', label: '連結', icon: ExternalLink },
    { value: 'note', label: '筆記', icon: FileText },
    { value: 'image', label: '圖片', icon: Image },
    { value: 'video', label: '影片', icon: Video },
    { value: 'file', label: '文件', icon: File },
    { value: 'research', label: '研究資料', icon: Lightbulb }
]

const ProjectTasks: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tasks' | 'references'>('tasks')
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [references, setReferences] = useState<ReferenceItem[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [referenceTags, setReferenceTags] = useState<string[]>([])
    const [tagStats, setTagStats] = useState<TagStats[]>([])
    const [referenceTagStats, setReferenceTagStats] = useState<TagStats[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedReferenceTags, setSelectedReferenceTags] = useState<string[]>([])
    const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())
    const [editingTodo, setEditingTodo] = useState<string | null>(null)
    const [editingReference, setEditingReference] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showAddReferenceForm, setShowAddReferenceForm] = useState(false)

    // 組織管理相關狀態
    const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([
        { id: '1', name: '精神支持組', icon: 'Heart', color: 'bg-pink-100 text-pink-800' },
        { id: '2', name: '開發組', icon: 'Settings', color: 'bg-blue-100 text-blue-800' },
        { id: '3', name: '管理組', icon: 'Users', color: 'bg-green-100 text-green-800' },
        { id: '4', name: '研究組', icon: 'Lightbulb', color: 'bg-yellow-100 text-yellow-800' }
    ])
    const [showAddOrganization, setShowAddOrganization] = useState(false)
    const [editingOrganization, setEditingOrganization] = useState<string | null>(null)
    const [newOrganization, setNewOrganization] = useState({
        name: '',
        icon: 'Building',
        color: 'bg-gray-100 text-gray-800'
    })

    const [newTodo, setNewTodo] = useState({
        title: '',
        description: '',
        tags: [] as string[],
        parentId: '',
        linkedTodos: [] as string[]
    })
    const [newReference, setNewReference] = useState({
        title: '',
        description: '',
        content: '',
        type: 'note' as ReferenceItem['type'],
        url: '',
        tags: [] as string[],
        organization: '',
        author: '',
        isPublic: true
    })
    const [newTag, setNewTag] = useState('')
    const [newReferenceTag, setNewReferenceTag] = useState('')
    const [editingTag, setEditingTag] = useState<string | null>(null)
    const [editTagValue, setEditTagValue] = useState('')
    const [loading, setLoading] = useState(true)

    // 編輯參考資料狀態
    const [editReferenceData, setEditReferenceData] = useState<ReferenceItem>({
        title: '',
        description: '',
        content: '',
        type: 'note',
        url: '',
        tags: [],
        organization: '',
        author: '',
        isPublic: true,
        bookmarked: false,
        createdAt: '',
        updatedAt: ''
    })

    // 獲取圖標組件
    const getIconComponent = (iconName: string) => {
        const iconData = availableIcons.find(icon => icon.name === iconName)
        return iconData ? iconData.icon : Building
    }

    // 載入數據
    const fetchTodos = async () => {
        try {
            setLoading(true)
            const response = await lumi.entities.project_tasks.list()
            const todoList = response.list || []
            setTodos(todoList)

            // 提取所有標籤
            const allTags = new Set<string>()
            todoList.forEach((todo: TodoItem) => {
                todo.tags?.forEach(tag => allTags.add(tag))
            })
            const tagsArray = Array.from(allTags)
            setTags(tagsArray)

            // 計算標籤統計
            calculateTagStats(todoList, tagsArray)
        } catch (error) {
            console.error('Failed to fetch todos:', error)
            toast.error('載入任務失敗')
        } finally {
            setLoading(false)
        }
    }

    const fetchReferences = async () => {
        try {
            // 使用localStorage來模擬持久化存儲
            const storedReferences = localStorage.getItem('project_references')
            const storedReferenceTags = localStorage.getItem('project_reference_tags')

            if (storedReferences) {
                const references = JSON.parse(storedReferences)
                setReferences(references)

                // 重新計算標籤
                const allReferenceTags = new Set<string>()
                references.forEach((ref: ReferenceItem) => {
                    ref.tags?.forEach(tag => allReferenceTags.add(tag))
                })
                const referenceTagsArray = Array.from(allReferenceTags)
                setReferenceTags(referenceTagsArray)
                calculateReferenceTagStats(references, referenceTagsArray)
            } else {
                // 初始化一些示例數據
                const mockReferences: ReferenceItem[] = [
                    {
                        _id: '1',
                        title: '聖經經文分享',
                        description: '關於希望與信心的經文整理',
                        content: '「我們有這指望，如同靈魂的錨，又堅固又牢靠」- 希伯來書6:19',
                        type: 'note',
                        tags: ['聖經', '希望', '信心'],
                        organization: '1',
                        author: '張牧師',
                        isPublic: true,
                        bookmarked: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        _id: '2',
                        title: '微藻培養技術論文',
                        description: 'MIT最新微藻培養效率研究',
                        content: '研究顯示新型LED光源可提升30%培養效率',
                        type: 'research',
                        url: 'https://example.com/microalgae-research',
                        tags: ['微藻', '培養技術', 'LED'],
                        organization: '4',
                        author: '李博士',
                        isPublic: true,
                        bookmarked: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]

                setReferences(mockReferences)
                localStorage.setItem('project_references', JSON.stringify(mockReferences))

                // 提取參考資料標籤
                const allReferenceTags = new Set<string>()
                mockReferences.forEach((ref: ReferenceItem) => {
                    ref.tags?.forEach(tag => allReferenceTags.add(tag))
                })
                const referenceTagsArray = Array.from(allReferenceTags)
                setReferenceTags(referenceTagsArray)
                localStorage.setItem('project_reference_tags', JSON.stringify(referenceTagsArray))

                // 計算參考資料標籤統計
                calculateReferenceTagStats(mockReferences, referenceTagsArray)
            }

            if (storedReferenceTags) {
                setReferenceTags(JSON.parse(storedReferenceTags))
            }
        } catch (error) {
            console.error('Failed to fetch references:', error)
            toast.error('載入參考資料失敗')
        }
    }

    // 保存參考資料到localStorage
    const saveReferencesToStorage = (updatedReferences: ReferenceItem[]) => {
        localStorage.setItem('project_references', JSON.stringify(updatedReferences))
    }

    const saveReferenceTagsToStorage = (updatedTags: string[]) => {
        localStorage.setItem('project_reference_tags', JSON.stringify(updatedTags))
    }

    // 組織管理函數
    const handleAddOrganization = () => {
        if (!newOrganization.name.trim()) {
            toast.error('請輸入組織名稱')
            return
        }

        const newOrg: OrganizationType = {
            id: Date.now().toString(),
            name: newOrganization.name,
            icon: newOrganization.icon,
            color: newOrganization.color
        }

        setOrganizationTypes(prev => [...prev, newOrg])
        setNewOrganization({
            name: '',
            icon: 'Building',
            color: 'bg-gray-100 text-gray-800'
        })
        setShowAddOrganization(false)
        toast.success('組織新增成功')
    }

    const handleUpdateOrganization = (id: string, updates: Partial<OrganizationType>) => {
        setOrganizationTypes(prev => prev.map(org =>
            org.id === id ? { ...org, ...updates } : org
        ))
        setEditingOrganization(null)
        toast.success('組織更新成功')
    }

    const handleDeleteOrganization = (id: string) => {
        if (!confirm('確定要刪除這個組織嗎？相關的參考資料將需要重新分配組織。')) return

        setOrganizationTypes(prev => prev.filter(org => org.id !== id))
        toast.success('組織刪除成功')
    }

    // 計算標籤統計
    const calculateTagStats = (todoList: TodoItem[], tagList: string[]) => {
        const totalTodos = todoList.length
        const stats = tagList.map(tag => {
            const count = todoList.filter(todo => todo.tags?.includes(tag)).length
            return {
                name: tag,
                count,
                percentage: totalTodos > 0 ? Math.round((count / totalTodos) * 100) : 0
            }
        }).sort((a, b) => b.count - a.count)

        setTagStats(stats)
    }

    const calculateReferenceTagStats = (referenceList: ReferenceItem[], tagList: string[]) => {
        const totalReferences = referenceList.length
        const stats = tagList.map(tag => {
            const count = referenceList.filter(ref => ref.tags?.includes(tag)).length
            return {
                name: tag,
                count,
                percentage: totalReferences > 0 ? Math.round((count / totalReferences) * 100) : 0
            }
        }).sort((a, b) => b.count - a.count)

        setReferenceTagStats(stats)
    }

    // 新增 Todo
    const handleAddTodo = async () => {
        if (!newTodo.title.trim()) {
            toast.error('請輸入任務標題')
            return
        }

        try {
            const todoData = {
                title: newTodo.title,
                description: newTodo.description,
                completed: false,
                tags: newTodo.tags,
                parentId: newTodo.parentId || undefined,
                linkedTodos: newTodo.linkedTodos,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await lumi.entities.project_tasks.create(todoData)
            toast.success('任務創建成功')
            setShowAddForm(false)
            setNewTodo({
                title: '',
                description: '',
                tags: [],
                parentId: '',
                linkedTodos: []
            })
            fetchTodos()
        } catch (error) {
            console.error('Failed to create todo:', error)
            toast.error('創建任務失敗')
        }
    }

    // 新增參考資料
    const handleAddReference = async () => {
        if (!newReference.title.trim()) {
            toast.error('請輸入資料標題')
            return
        }

        try {
            const referenceData: ReferenceItem = {
                _id: Date.now().toString(),
                ...newReference,
                bookmarked: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const updatedReferences = [...references, referenceData]
            setReferences(updatedReferences)
            saveReferencesToStorage(updatedReferences)

            // 更新標籤
            const allTags = new Set(referenceTags)
            newReference.tags.forEach(tag => allTags.add(tag))
            const updatedTags = Array.from(allTags)
            setReferenceTags(updatedTags)
            saveReferenceTagsToStorage(updatedTags)
            calculateReferenceTagStats(updatedReferences, updatedTags)

            toast.success('參考資料創建成功')
            setShowAddReferenceForm(false)
            setNewReference({
                title: '',
                description: '',
                content: '',
                type: 'note',
                url: '',
                tags: [],
                organization: '',
                author: '',
                isPublic: true
            })
        } catch (error) {
            console.error('Failed to create reference:', error)
            toast.error('創建參考資料失敗')
        }
    }

    // 更新參考資料
    const handleUpdateReference = async () => {
        if (!editReferenceData.title.trim()) {
            toast.error('請輸入資料標題')
            return
        }

        try {
            const updatedReference = {
                ...editReferenceData,
                updatedAt: new Date().toISOString()
            }

            const updatedReferences = references.map(ref =>
                ref._id === editingReference ? updatedReference : ref
            )

            setReferences(updatedReferences)
            saveReferencesToStorage(updatedReferences)

            // 重新計算標籤
            const allTags = new Set<string>()
            updatedReferences.forEach(ref => {
                ref.tags?.forEach(tag => allTags.add(tag))
            })
            const updatedTags = Array.from(allTags)
            setReferenceTags(updatedTags)
            saveReferenceTagsToStorage(updatedTags)
            calculateReferenceTagStats(updatedReferences, updatedTags)

            toast.success('參考資料更新成功')
            setEditingReference(null)
        } catch (error) {
            console.error('Failed to update reference:', error)
            toast.error('更新參考資料失敗')
        }
    }

    // 更新 Todo
    const handleUpdateTodo = async (id: string, updates: Partial<TodoItem>) => {
        try {
            await lumi.entities.project_tasks.update(id, {
                ...updates,
                updatedAt: new Date().toISOString()
            })
            toast.success('任務更新成功')
            fetchTodos()
        } catch (error) {
            console.error('Failed to update todo:', error)
            toast.error('更新任務失敗')
        }
    }

    // 刪除 Todo
    const handleDeleteTodo = async (id: string) => {
        if (!confirm('確定要刪除這個任務嗎？')) return

        try {
            await lumi.entities.project_tasks.delete(id)
            toast.success('任務刪除成功')
            fetchTodos()
        } catch (error) {
            console.error('Failed to delete todo:', error)
            toast.error('刪除任務失敗')
        }
    }

    // 刪除參考資料
    const handleDeleteReference = (id: string) => {
        if (!confirm('確定要刪除這個參考資料嗎？')) return

        const updatedReferences = references.filter(ref => ref._id !== id)
        setReferences(updatedReferences)
        saveReferencesToStorage(updatedReferences)

        // 重新計算標籤
        const allTags = new Set<string>()
        updatedReferences.forEach(ref => {
            ref.tags?.forEach(tag => allTags.add(tag))
        })
        const updatedTags = Array.from(allTags)
        setReferenceTags(updatedTags)
        saveReferenceTagsToStorage(updatedTags)
        calculateReferenceTagStats(updatedReferences, updatedTags)

        toast.success('參考資料刪除成功')
    }

    // 切換書籤
    const toggleBookmark = (id: string) => {
        const updatedReferences = references.map(ref =>
            ref._id === id ? { ...ref, bookmarked: !ref.bookmarked } : ref
        )
        setReferences(updatedReferences)
        saveReferencesToStorage(updatedReferences)
    }

    // 切換完成狀態
    const toggleComplete = (todo: TodoItem) => {
        if (todo._id) {
            handleUpdateTodo(todo._id, { completed: !todo.completed })
        }
    }

    // 新增標籤
    const handleAddTag = () => {
        if (!newTag.trim() || tags.includes(newTag.trim())) {
            toast.error('標籤已存在或為空')
            return
        }

        const updatedTags = [...tags, newTag.trim()]
        setTags(updatedTags)
        setNewTag('')
        toast.success('標籤新增成功')
    }

    const handleAddReferenceTag = () => {
        if (!newReferenceTag.trim() || referenceTags.includes(newReferenceTag.trim())) {
            toast.error('標籤已存在或為空')
            return
        }

        const updatedTags = [...referenceTags, newReferenceTag.trim()]
        setReferenceTags(updatedTags)
        saveReferenceTagsToStorage(updatedTags)
        setNewReferenceTag('')
        toast.success('標籤新增成功')
    }

    // 刪除標籤
    const handleDeleteReferenceTag = (tagToDelete: string) => {
        if (!confirm(`確定要刪除標籤「${tagToDelete}」嗎？這將從所有參考資料中移除此標籤。`)) return

        // 從標籤列表中移除
        const updatedTags = referenceTags.filter(tag => tag !== tagToDelete)
        setReferenceTags(updatedTags)
        saveReferenceTagsToStorage(updatedTags)

        // 從所有參考資料中移除此標籤
        const updatedReferences = references.map(ref => ({
            ...ref,
            tags: ref.tags.filter(tag => tag !== tagToDelete)
        }))
        setReferences(updatedReferences)
        saveReferencesToStorage(updatedReferences)

        // 重新計算統計
        calculateReferenceTagStats(updatedReferences, updatedTags)

        // 如果當前選中了這個標籤，也要移除
        setSelectedReferenceTags(prev => prev.filter(tag => tag !== tagToDelete))

        toast.success('標籤刪除成功')
    }

    // 獲取子項目
    const getSubTodos = (parentId: string) => {
        return todos.filter(todo => todo.parentId === parentId)
    }

    // 獲取根級別的 todos
    const getRootTodos = () => {
        return todos.filter(todo => !todo.parentId)
    }

    // 過濾 todos
    const getFilteredTodos = (todoList: TodoItem[]) => {
        if (selectedTags.length === 0) return todoList
        return todoList.filter(todo =>
            selectedTags.some(tag => todo.tags?.includes(tag))
        )
    }

    // 過濾參考資料
    const getFilteredReferences = () => {
        let filtered = references

        // 標籤篩選
        if (selectedReferenceTags.length > 0) {
            filtered = filtered.filter(ref =>
                selectedReferenceTags.some(tag => ref.tags?.includes(tag))
            )
        }

        // 組織篩選
        if (selectedOrganizations.length > 0) {
            filtered = filtered.filter(ref =>
                selectedOrganizations.includes(ref.organization)
            )
        }

        // 搜尋篩選
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(ref =>
                ref.title.toLowerCase().includes(query) ||
                ref.description.toLowerCase().includes(query) ||
                ref.content.toLowerCase().includes(query) ||
                ref.author.toLowerCase().includes(query)
            )
        }

        return filtered
    }

    // 切換展開狀態
    const toggleExpanded = (todoId: string) => {
        const newExpanded = new Set(expandedTodos)
        if (newExpanded.has(todoId)) {
            newExpanded.delete(todoId)
        } else {
            newExpanded.add(todoId)
        }
        setExpandedTodos(newExpanded)
    }

    // 開始編輯參考資料
    const startEditReference = (reference: ReferenceItem) => {
        setEditReferenceData({ ...reference })
        setEditingReference(reference._id || '')
    }

    useEffect(() => {
        fetchTodos()
        fetchReferences()
    }, [])

    // Todo 項目組件
    const TodoItemComponent: React.FC<{ todo: TodoItem; level?: number }> = ({ todo, level = 0 }) => {
        const subTodos = getSubTodos(todo._id || '')
        const hasSubTodos = subTodos.length > 0
        const isExpanded = expandedTodos.has(todo._id || '')
        const linkedTodos = todos.filter(t => todo.linkedTodos?.includes(t._id || ''))

        return (
            <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            {hasSubTodos && (
                                <button
                                    onClick={() => toggleExpanded(todo._id || '')}
                                    className="mt-1 text-gray-400 hover:text-gray-600"
                                >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            )}

                            <button
                                onClick={() => toggleComplete(todo)}
                                className="mt-1"
                            >
                                {todo.completed ? (
                                    <CheckSquare className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Square className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <div className="flex-1">
                                <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {todo.title}
                                </h3>
                                {todo.description && (
                                    <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                                )}

                                {/* 標籤顯示 */}
                                {todo.tags && todo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {todo.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                <Hash className="w-3 h-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 連結的任務 */}
                                {linkedTodos.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">連結任務:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {linkedTodos.map(linkedTodo => (
                                                <span
                                                    key={linkedTodo._id}
                                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                                >
                                                    <Link className="w-3 h-3 mr-1" />
                                                    {linkedTodo.title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setEditingTodo(todo._id || '')}
                                className="text-gray-400 hover:text-blue-600"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteTodo(todo._id || '')}
                                className="text-gray-400 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 子項目 */}
                {hasSubTodos && isExpanded && (
                    <div className="ml-4">
                        {subTodos.map(subTodo => (
                            <TodoItemComponent key={subTodo._id} todo={subTodo} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // 參考資料卡片組件
    const ReferenceCard: React.FC<{ reference: ReferenceItem }> = ({ reference }) => {
        const organization = organizationTypes.find(org => org.id === reference.organization)
        const typeInfo = referenceTypes.find(type => type.value === reference.type)
        const TypeIcon = typeInfo?.icon || FileText
        const OrgIcon = organization ? getIconComponent(organization.icon) : Building

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <TypeIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{reference.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => toggleBookmark(reference._id || '')}
                            className={`${reference.bookmarked ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                        >
                            <Bookmark className={`w-4 h-4 ${reference.bookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={() => startEditReference(reference)}
                            className="text-gray-400 hover:text-blue-600"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteReference(reference._id || '')}
                            className="text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{reference.description}</p>

                <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <p className="text-sm text-gray-800">{reference.content}</p>
                    {reference.url && (
                        <a
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            查看連結
                        </a>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {organization && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${organization.color}`}>
                                <OrgIcon className="w-3 h-3 mr-1" />
                                {organization.name}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">by {reference.author}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {reference.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                                <Hash className="w-3 h-3 mr-1" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    const filteredRootTodos = getFilteredTodos(getRootTodos())
    const filteredReferences = getFilteredReferences()

    return (
        <div className="flex h-full">
            {/* 左側篩選面板 */}
            <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                {/* 標籤頁切換 */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tasks'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        專案任務
                    </button>
                    <button
                        onClick={() => setActiveTab('references')}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'references'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        參考資料
                    </button>
                </div>

                {activeTab === 'tasks' ? (
                    // 任務篩選面板
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">任務標籤</h2>

                        {/* 新增標籤 */}
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="新增標籤..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* 標籤篩選 */}
                        <div className="mb-4">
                            <button
                                onClick={() => setSelectedTags([])}
                                className={`px-3 py-1 rounded-full text-sm mr-2 mb-2 ${selectedTags.length === 0
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                全部
                            </button>
                        </div>

                        {/* 標籤列表 */}
                        <div className="space-y-2">
                            {tagStats.map(tag => (
                                <button
                                    key={tag.name}
                                    onClick={() => {
                                        const newSelected = selectedTags.includes(tag.name)
                                            ? selectedTags.filter(t => t !== tag.name)
                                            : [...selectedTags, tag.name]
                                        setSelectedTags(newSelected)
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${selectedTags.includes(tag.name)
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Hash className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">{tag.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{tag.count}</div>
                                        <div className="text-xs text-gray-500">{tag.percentage}%</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // 參考資料篩選面板
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">參考資料篩選</h2>

                        {/* 搜尋框 */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="搜尋標題、內容、作者..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>

                        {/* 組織篩選 */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-700">組織篩選</h3>
                                <button
                                    onClick={() => setShowAddOrganization(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    新增
                                </button>
                            </div>

                            {/* 新增組織表單 */}
                            {showAddOrganization && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={newOrganization.name}
                                            onChange={(e) => setNewOrganization({ ...newOrganization, name: e.target.value })}
                                            placeholder="組織名稱..."
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        />

                                        {/* 圖標選擇 */}
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">選擇圖標:</p>
                                            <div className="grid grid-cols-5 gap-1">
                                                {availableIcons.slice(0, 10).map(iconData => {
                                                    const IconComponent = iconData.icon
                                                    return (
                                                        <button
                                                            key={iconData.name}
                                                            onClick={() => setNewOrganization({ ...newOrganization, icon: iconData.name })}
                                                            className={`p-1 rounded border ${newOrganization.icon === iconData.name
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <IconComponent className="w-3 h-3" />
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* 顏色選擇 */}
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">選擇顏色:</p>
                                            <div className="grid grid-cols-4 gap-1">
                                                {availableColors.map(color => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setNewOrganization({ ...newOrganization, color: color.value })}
                                                        className={`h-6 rounded border-2 ${color.preview} ${newOrganization.color === color.value
                                                                ? 'border-gray-600'
                                                                : 'border-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-1 pt-1">
                                            <button
                                                onClick={handleAddOrganization}
                                                className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                            >
                                                <Save className="w-3 h-3 inline mr-1" />
                                                保存
                                            </button>
                                            <button
                                                onClick={() => setShowAddOrganization(false)}
                                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                {organizationTypes.map(org => {
                                    const OrgIcon = getIconComponent(org.icon)
                                    return (
                                        <div key={org.id} className="flex items-center group">
                                            <button
                                                onClick={() => {
                                                    const newSelected = selectedOrganizations.includes(org.id)
                                                        ? selectedOrganizations.filter(o => o !== org.id)
                                                        : [...selectedOrganizations, org.id]
                                                    setSelectedOrganizations(newSelected)
                                                }}
                                                className={`flex-1 flex items-center px-3 py-2 rounded-lg text-left ${selectedOrganizations.includes(org.id)
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <OrgIcon className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{org.name}</span>
                                            </button>

                                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2">
                                                <button
                                                    onClick={() => setEditingOrganization(org.id)}
                                                    className="text-gray-400 hover:text-blue-600"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrganization(org.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 新增參考資料標籤 */}
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">標籤管理</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newReferenceTag}
                                    onChange={(e) => setNewReferenceTag(e.target.value)}
                                    placeholder="新增標籤..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddReferenceTag()}
                                />
                                <button
                                    onClick={handleAddReferenceTag}
                                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* 參考資料標籤篩選 */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedReferenceTags([])}
                                className={`px-3 py-1 rounded-full text-sm mr-2 mb-2 ${selectedReferenceTags.length === 0
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                全部標籤
                            </button>

                            {referenceTagStats.map(tag => (
                                <div key={tag.name} className="flex items-center group">
                                    <button
                                        onClick={() => {
                                            const newSelected = selectedReferenceTags.includes(tag.name)
                                                ? selectedReferenceTags.filter(t => t !== tag.name)
                                                : [...selectedReferenceTags, tag.name]
                                            setSelectedReferenceTags(newSelected)
                                        }}
                                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-left ${selectedReferenceTags.includes(tag.name)
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Hash className="w-4 h-4 mr-2" />
                                            <span className="text-sm font-medium">{tag.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{tag.count}</div>
                                            <div className="text-xs text-gray-500">{tag.percentage}%</div>
                                        </div>
                                    </button>

                                    <div className="opacity-0 group-hover:opacity-100 ml-2">
                                        <button
                                            onClick={() => handleDeleteReferenceTag(tag.name)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 右側主內容 */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'tasks' ? '專案任務管理' : '研究資料與專案參考'}
                        </h1>
                        <button
                            onClick={() => activeTab === 'tasks' ? setShowAddForm(true) : setShowAddReferenceForm(true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {activeTab === 'tasks' ? '新增任務' : '新增資料'}
                        </button>
                    </div>
                </div>

                {activeTab === 'tasks' ? (
                    <>
                        {/* 新增任務表單 */}
                        {showAddForm && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">新增任務</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">任務標題</label>
                                        <input
                                            type="text"
                                            value={newTodo.title}
                                            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="輸入任務標題..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">任務描述</label>
                                        <textarea
                                            value={newTodo.description}
                                            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows={3}
                                            placeholder="輸入任務描述..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        const updatedTags = newTodo.tags.includes(tag)
                                                            ? newTodo.tags.filter(t => t !== tag)
                                                            : [...newTodo.tags, tag]
                                                        setNewTodo({ ...newTodo, tags: updatedTags })
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm ${newTodo.tags.includes(tag)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">父任務</label>
                                        <select
                                            value={newTodo.parentId}
                                            onChange={(e) => setNewTodo({ ...newTodo, parentId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">無父任務</option>
                                            {todos.map(todo => (
                                                <option key={todo._id} value={todo._id}>
                                                    {todo.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handleAddTodo}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            創建任務
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 任務列表 */}
                        <div className="space-y-4">
                            {filteredRootTodos.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">暫無任務，點擊新增按鈕創建第一個任務</p>
                                </div>
                            ) : (
                                filteredRootTodos.map(todo => (
                                    <TodoItemComponent key={todo._id} todo={todo} />
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* 新增參考資料表單 */}
                        {showAddReferenceForm && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">新增參考資料</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">資料標題</label>
                                            <input
                                                type="text"
                                                value={newReference.title}
                                                onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="輸入資料標題..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">資料類型</label>
                                            <select
                                                value={newReference.type}
                                                onChange={(e) => setNewReference({ ...newReference, type: e.target.value as ReferenceItem['type'] })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                {referenceTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                        <input
                                            type="text"
                                            value={newReference.description}
                                            onChange={(e) => setNewReference({ ...newReference, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="簡短描述..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">內容</label>
                                        <textarea
                                            value={newReference.content}
                                            onChange={(e) => setNewReference({ ...newReference, content: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows={4}
                                            placeholder="詳細內容、筆記或重點摘要..."
                                        />
                                    </div>

                                    {(newReference.type === 'link' || newReference.type === 'video' || newReference.type === 'file') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">網址連結</label>
                                            <input
                                                type="url"
                                                value={newReference.url}
                                                onChange={(e) => setNewReference({ ...newReference, url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">所屬組織</label>
                                            <select
                                                value={newReference.organization}
                                                onChange={(e) => setNewReference({ ...newReference, organization: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">選擇組織...</option>
                                                {organizationTypes.map(org => (
                                                    <option key={org.id} value={org.id}>
                                                        {org.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                                            <input
                                                type="text"
                                                value={newReference.author}
                                                onChange={(e) => setNewReference({ ...newReference, author: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="作者姓名..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                                        <div className="flex flex-wrap gap-2">
                                            {referenceTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        const updatedTags = newReference.tags.includes(tag)
                                                            ? newReference.tags.filter(t => t !== tag)
                                                            : [...newReference.tags, tag]
                                                        setNewReference({ ...newReference, tags: updatedTags })
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm ${newReference.tags.includes(tag)
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={newReference.isPublic}
                                            onChange={(e) => setNewReference({ ...newReference, isPublic: e.target.checked })}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                                            公開分享給其他組織
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowAddReferenceForm(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handleAddReference}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            創建資料
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 編輯參考資料表單 */}
                        {editingReference && (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">編輯參考資料</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">資料標題</label>
                                            <input
                                                type="text"
                                                value={editReferenceData.title}
                                                onChange={(e) => setEditReferenceData({ ...editReferenceData, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="輸入資料標題..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">資料類型</label>
                                            <select
                                                value={editReferenceData.type}
                                                onChange={(e) => setEditReferenceData({ ...editReferenceData, type: e.target.value as ReferenceItem['type'] })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                {referenceTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                        <input
                                            type="text"
                                            value={editReferenceData.description}
                                            onChange={(e) => setEditReferenceData({ ...editReferenceData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="簡短描述..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">內容</label>
                                        <textarea
                                            value={editReferenceData.content}
                                            onChange={(e) => setEditReferenceData({ ...editReferenceData, content: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            rows={4}
                                            placeholder="詳細內容、筆記或重點摘要..."
                                        />
                                    </div>

                                    {(editReferenceData.type === 'link' || editReferenceData.type === 'video' || editReferenceData.type === 'file') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">網址連結</label>
                                            <input
                                                type="url"
                                                value={editReferenceData.url || ''}
                                                onChange={(e) => setEditReferenceData({ ...editReferenceData, url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">所屬組織</label>
                                            <select
                                                value={editReferenceData.organization}
                                                onChange={(e) => setEditReferenceData({ ...editReferenceData, organization: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">選擇組織...</option>
                                                {organizationTypes.map(org => (
                                                    <option key={org.id} value={org.id}>
                                                        {org.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                                            <input
                                                type="text"
                                                value={editReferenceData.author}
                                                onChange={(e) => setEditReferenceData({ ...editReferenceData, author: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                placeholder="作者姓名..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                                        <div className="flex flex-wrap gap-2">
                                            {referenceTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        const updatedTags = editReferenceData.tags.includes(tag)
                                                            ? editReferenceData.tags.filter(t => t !== tag)
                                                            : [...editReferenceData.tags, tag]
                                                        setEditReferenceData({ ...editReferenceData, tags: updatedTags })
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm ${editReferenceData.tags.includes(tag)
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="editIsPublic"
                                            checked={editReferenceData.isPublic}
                                            onChange={(e) => setEditReferenceData({ ...editReferenceData, isPublic: e.target.checked })}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <label htmlFor="editIsPublic" className="ml-2 text-sm text-gray-700">
                                            公開分享給其他組織
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setEditingReference(null)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handleUpdateReference}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            更新資料
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 參考資料列表 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredReferences.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">暫無參考資料，點擊新增按鈕創建第一筆資料</p>
                                </div>
                            ) : (
                                filteredReferences.map(reference => (
                                    <ReferenceCard key={reference._id} reference={reference} />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ProjectTasks
