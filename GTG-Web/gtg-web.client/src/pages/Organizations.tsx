
import React, { useState, useEffect } from 'react'
import { Users, Phone, Mail, MapPin, Plus, Edit, Trash2, AlertCircle, CheckCircle, Clock, Wifi, UserPlus, Star, Award, Search, Filter, Crown, User as UserIcon, Shield } from 'lucide-react'
import { lumi } from '../lib/lumi'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface Member {
    _id: string
    name: string
    position: string
    phone: string
    email: string
    skills: string[]
    joinDate: string
    status: 'active' | 'inactive' | 'on_leave'
    userId?: string // 關聯的用戶ID
    userRole?: 'ADMIN' | 'USER'
}

interface Organization {
    _id: string
    name: string
    type: string
    contactPerson: string
    phone: string
    email: string
    location: {
        address: string
        coordinates?: {
            lat: number
            lng: number
        }
    }
    status: string
    capabilities: string[]
    members?: Member[]
    createdAt: string
    updatedAt: string
}

interface SystemUser {
    userId: string
    userName: string
    email: string
    userRole: 'ADMIN' | 'USER'
    createdTime: string
}

const Organizations: React.FC = () => {
    const { isAdmin } = useAuth()
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [systemUsers, setSystemUsers] = useState<SystemUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
    const [showMemberForm, setShowMemberForm] = useState(false)
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [activeTab, setActiveTab] = useState<'info' | 'members'>('info')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const organizationTypes = [
        { value: 'disaster_response', label: '災難應變', color: 'bg-red-100 text-red-800', icon: Shield },
        { value: 'communication', label: '通訊聯絡', color: 'bg-blue-100 text-blue-800', icon: Phone },
        { value: 'logistics', label: '物流管理', color: 'bg-green-100 text-green-800', icon: MapPin },
        { value: 'research', label: '研究開發', color: 'bg-purple-100 text-purple-800', icon: Star },
        { value: 'support', label: '支援服務', color: 'bg-yellow-100 text-yellow-800', icon: Award }
    ]

    const statusConfig = {
        active: { label: '活躍', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
        standby: { label: '待命', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
        emergency: { label: '緊急', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
        offline: { label: '離線', icon: Wifi, color: 'text-gray-400', bgColor: 'bg-gray-100' }
    }

    const memberStatusConfig = {
        active: { label: '在職', color: 'bg-green-100 text-green-800' },
        inactive: { label: '離職', color: 'bg-gray-100 text-gray-800' },
        on_leave: { label: '請假', color: 'bg-yellow-100 text-yellow-800' }
    }

    // 模擬獲取系統用戶列表
    const fetchSystemUsers = async () => {
        try {
            // 這裡應該調用實際的API獲取系統用戶
            // 目前使用模擬數據
            const mockUsers: SystemUser[] = [
                {
                    userId: 'user1',
                    userName: '張三',
                    email: 'zhang@example.com',
                    userRole: 'USER',
                    createdTime: '2025-01-01T00:00:00Z'
                },
                {
                    userId: 'user2',
                    userName: '李四',
                    email: 'li@example.com',
                    userRole: 'ADMIN',
                    createdTime: '2025-01-02T00:00:00Z'
                },
                {
                    userId: 'user3',
                    userName: '王五',
                    email: 'wang@example.com',
                    userRole: 'USER',
                    createdTime: '2025-01-03T00:00:00Z'
                }
            ]
            setSystemUsers(mockUsers)
        } catch (error) {
            console.error('Failed to fetch system users:', error)
        }
    }

    const fetchOrganizations = async () => {
        try {
            setLoading(true)
            const response = await lumi.entities.organizations.list({
                sort: { createdAt: -1 }
            })
            setOrganizations(response.list || [])
        } catch (error) {
            console.error('Failed to fetch organizations:', error)
            toast.error('載入組織資料失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const capabilities = (formData.get('capabilities') as string)
            .split(',')
            .map(cap => cap.trim())
            .filter(cap => cap.length > 0)

        const orgData = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            contactPerson: formData.get('contactPerson') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            location: {
                address: formData.get('address') as string
            },
            status: formData.get('status') as string,
            capabilities,
            members: editingOrg?.members || [],
            updatedAt: new Date().toISOString()
        }

        try {
            if (editingOrg) {
                await lumi.entities.organizations.update(editingOrg._id, orgData)
                toast.success('組織資料更新成功')
            } else {
                await lumi.entities.organizations.create({
                    ...orgData,
                    createdAt: new Date().toISOString()
                })
                toast.success('新增組織成功')
            }

            setShowForm(false)
            setEditingOrg(null)
            fetchOrganizations()
        } catch (error) {
            console.error('Failed to save organization:', error)
            toast.error('儲存組織資料失敗')
        }
    }

    const handleMemberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedOrg) return

        const formData = new FormData(event.currentTarget)
        const selectedUserId = formData.get('userId') as string
        const selectedUser = systemUsers.find(u => u.userId === selectedUserId)

        const skills = (formData.get('skills') as string)
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0)

        const memberData: Member = {
            _id: editingMember?._id || `member_${Date.now()}`,
            name: selectedUser?.userName || (formData.get('name') as string),
            position: formData.get('position') as string,
            phone: formData.get('phone') as string,
            email: selectedUser?.email || (formData.get('email') as string),
            skills,
            status: formData.get('status') as 'active' | 'inactive' | 'on_leave',
            joinDate: editingMember?.joinDate || new Date().toISOString(),
            userId: selectedUserId || undefined,
            userRole: selectedUser?.userRole
        }

        try {
            const updatedMembers = editingMember
                ? selectedOrg.members?.map(m => m._id === editingMember._id ? memberData : m) || [memberData]
                : [...(selectedOrg.members || []), memberData]

            await lumi.entities.organizations.update(selectedOrg._id, {
                ...selectedOrg,
                members: updatedMembers,
                updatedAt: new Date().toISOString()
            })

            toast.success(editingMember ? '成員資料更新成功' : '新增成員成功')
            setShowMemberForm(false)
            setEditingMember(null)
            fetchOrganizations()
        } catch (error) {
            console.error('Failed to save member:', error)
            toast.error('儲存成員資料失敗')
        }
    }

    const handleDeleteMember = async (memberId: string, memberName: string) => {
        if (!selectedOrg || !confirm(`確定要刪除成員「${memberName}」嗎？`)) return

        try {
            const updatedMembers = selectedOrg.members?.filter(m => m._id !== memberId) || []

            await lumi.entities.organizations.update(selectedOrg._id, {
                ...selectedOrg,
                members: updatedMembers,
                updatedAt: new Date().toISOString()
            })

            toast.success('成員刪除成功')
            fetchOrganizations()
        } catch (error) {
            console.error('Failed to delete member:', error)
            toast.error('刪除成員失敗')
        }
    }

    const handleDelete = async (orgId: string, orgName: string) => {
        if (!confirm(`確定要刪除組織「${orgName}」嗎？`)) return

        try {
            await lumi.entities.organizations.delete(orgId)
            toast.success('組織刪除成功')
            fetchOrganizations()
        } catch (error) {
            console.error('Failed to delete organization:', error)
            toast.error('刪除組織失敗')
        }
    }

    const getTypeLabel = (type: string) => {
        const typeConfig = organizationTypes.find(t => t.value === type)
        return typeConfig ? typeConfig.label : type
    }

    const getTypeColor = (type: string) => {
        const typeConfig = organizationTypes.find(t => t.value === type)
        return typeConfig ? typeConfig.color : 'bg-gray-100 text-gray-800'
    }

    const getTypeIcon = (type: string) => {
        const typeConfig = organizationTypes.find(t => t.value === type)
        return typeConfig ? typeConfig.icon : Shield
    }

    // 過濾組織
    const filteredOrganizations = organizations.filter(org => {
        const matchesSearch = searchQuery === '' ||
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || org.status === statusFilter
        const matchesType = typeFilter === 'all' || org.type === typeFilter

        return matchesSearch && matchesStatus && matchesType
    })

    useEffect(() => {
        fetchOrganizations()
        fetchSystemUsers()
    }, [])

    useEffect(() => {
        if (selectedOrg) {
            const updated = organizations.find(org => org._id === selectedOrg._id)
            if (updated) {
                setSelectedOrg(updated)
            }
        }
    }, [organizations, selectedOrg])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20"></div>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">組織管理</h1>
                            <p className="text-emerald-100 text-lg">災難應變團隊與聯絡群組管理</p>
                            <div className="flex items-center space-x-6 mt-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                                    <span className="text-sm">總組織數: {organizations.length}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                                    <span className="text-sm">活躍組織: {organizations.filter(o => o.status === 'active').length}</span>
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setEditingOrg(null)
                                    setShowForm(true)
                                }}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                <span>新增組織</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="搜尋組織..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="all">所有狀態</option>
                        <option value="active">活躍</option>
                        <option value="standby">待命</option>
                        <option value="emergency">緊急</option>
                        <option value="offline">離線</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="all">所有類型</option>
                        {organizationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <Filter className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">共 {filteredOrganizations.length} 個結果</span>
                    </div>
                </div>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => {
                    const StatusIcon = statusConfig[org.status as keyof typeof statusConfig]?.icon || AlertCircle
                    const TypeIcon = getTypeIcon(org.type)
                    const memberCount = org.members?.length || 0
                    const activeMembers = org.members?.filter(m => m.status === 'active').length || 0

                    return (
                        <div key={org._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-xl ${getTypeColor(org.type)}`}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(org.type)}`}>
                                                {getTypeLabel(org.type)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${statusConfig[org.status as keyof typeof statusConfig]?.bgColor || 'bg-gray-100'}`}>
                                        <StatusIcon className={`w-4 h-4 ${statusConfig[org.status as keyof typeof statusConfig]?.color || 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${statusConfig[org.status as keyof typeof statusConfig]?.color || 'text-gray-400'}`}>
                                            {statusConfig[org.status as keyof typeof statusConfig]?.label || org.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                        <Users className="w-4 h-4" />
                                        <span>成員 {activeMembers}/{memberCount}</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {org.members?.slice(0, 3).map((member, index) => (
                                            <div key={member._id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${member.userRole === 'ADMIN' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'
                                                }`}>
                                                {member.userRole === 'ADMIN' ? <Crown className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                            </div>
                                        ))}
                                        {memberCount > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                +{memberCount - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <span>{org.contactPerson}</span>
                                </div>

                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-blue-500" />
                                    <span>{org.phone}</span>
                                </div>

                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-purple-500" />
                                    <span className="truncate">{org.email}</span>
                                </div>

                                <div className="flex items-start space-x-3 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5 text-red-500" />
                                    <span className="line-clamp-2">{org.location.address}</span>
                                </div>

                                {/* Capabilities */}
                                {org.capabilities && org.capabilities.length > 0 && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">組織能力</p>
                                        <div className="flex flex-wrap gap-1">
                                            {org.capabilities.slice(0, 3).map((capability, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex px-2 py-1 text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg border border-emerald-200"
                                                >
                                                    {capability}
                                                </span>
                                            ))}
                                            {org.capabilities.length > 3 && (
                                                <span className="text-xs text-gray-500 px-2 py-1">+{org.capabilities.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => {
                                        setSelectedOrg(org)
                                        setActiveTab('info')
                                    }}
                                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
                                >
                                    查看詳情
                                </button>
                                {isAdmin && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingOrg(org)
                                                setShowForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(org._id, org.name)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Organization Detail Modal */}
            {selectedOrg && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${getTypeColor(selectedOrg.type)}`}>
                                        {React.createElement(getTypeIcon(selectedOrg.type), { className: "w-6 h-6" })}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedOrg.name}</h2>
                                        <p className="text-gray-600">{getTypeLabel(selectedOrg.type)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrg(null)}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex space-x-1 mt-6">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'info'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    組織資訊
                                </button>
                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'members'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    成員管理 ({selectedOrg.members?.length || 0})
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <Phone className="w-5 h-5 mr-2 text-blue-500" />
                                                聯絡資訊
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">聯絡人</p>
                                                        <p className="font-medium">{selectedOrg.contactPerson}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Phone className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">電話</p>
                                                        <p className="font-medium">{selectedOrg.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Mail className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">電子郵件</p>
                                                        <p className="font-medium">{selectedOrg.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">地址</p>
                                                        <p className="font-medium">{selectedOrg.location.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <Star className="w-5 h-5 mr-2 text-emerald-500" />
                                                組織能力
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOrg.capabilities?.map((capability, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex px-3 py-2 text-sm bg-white/80 text-emerald-800 rounded-lg border border-emerald-200 shadow-sm"
                                                    >
                                                        {capability}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900">組織成員</h3>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    setEditingMember(null)
                                                    setShowMemberForm(true)
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                <span>新增成員</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedOrg.members?.map((member) => (
                                            <div key={member._id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${member.userRole === 'ADMIN'
                                                                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                                                            }`}>
                                                            {member.userRole === 'ADMIN' ? (
                                                                <Crown className="w-5 h-5 text-white" />
                                                            ) : (
                                                                <UserIcon className="w-5 h-5 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                                            <p className="text-sm text-gray-600">{member.position}</p>
                                                            {member.userRole && (
                                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${member.userRole === 'ADMIN'
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                    {member.userRole === 'ADMIN' ? '管理員' : '一般用戶'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${memberStatusConfig[member.status].color}`}>
                                                            {memberStatusConfig[member.status].label}
                                                        </span>
                                                        {isAdmin && (
                                                            <div className="flex space-x-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingMember(member)
                                                                        setShowMemberForm(true)
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMember(member._id, member.name)}
                                                                    className="text-red-600 hover:text-red-800 p-1"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span>{member.phone}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate">{member.email}</span>
                                                    </div>
                                                </div>

                                                {member.skills && member.skills.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center space-x-1 mb-2">
                                                            <Star className="w-4 h-4 text-yellow-500" />
                                                            <span className="text-xs font-medium text-gray-500">專業技能</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.skills.map((skill, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex px-2 py-1 text-xs bg-white/80 text-blue-700 rounded border border-blue-200"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )) || (
                                                <div className="col-span-2 text-center py-8 text-gray-500">
                                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>尚無成員資料</p>
                                                    <p className="text-sm">點擊上方按鈕新增第一位成員</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Organization Form Modal */}
            {showForm && isAdmin && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingOrg ? '編輯組織' : '新增組織'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        組織名稱 *
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        defaultValue={editingOrg?.name || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        組織類型 *
                                    </label>
                                    <select
                                        name="type"
                                        required
                                        defaultValue={editingOrg?.type || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">請選擇類型</option>
                                        {organizationTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        聯絡人 *
                                    </label>
                                    <input
                                        name="contactPerson"
                                        type="text"
                                        required
                                        defaultValue={editingOrg?.contactPerson || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        聯絡電話 *
                                    </label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        defaultValue={editingOrg?.phone || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    電子郵件 *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={editingOrg?.email || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    地址 *
                                </label>
                                <input
                                    name="address"
                                    type="text"
                                    required
                                    defaultValue={editingOrg?.location.address || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    狀態 *
                                </label>
                                <select
                                    name="status"
                                    required
                                    defaultValue={editingOrg?.status || 'active'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="active">活躍</option>
                                    <option value="standby">待命</option>
                                    <option value="emergency">緊急</option>
                                    <option value="offline">離線</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    組織能力 (用逗號分隔)
                                </label>
                                <input
                                    name="capabilities"
                                    type="text"
                                    defaultValue={editingOrg?.capabilities?.join(', ') || ''}
                                    placeholder="例如：災難應變, 緊急協調, 資源調度"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingOrg(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    {editingOrg ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Member Form Modal */}
            {showMemberForm && isAdmin && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingMember ? '編輯成員' : '新增成員'}
                            </h2>
                        </div>

                        <form onSubmit={handleMemberSubmit} className="p-6 space-y-4">
                            {!editingMember && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        選擇系統用戶
                                    </label>
                                    <select
                                        name="userId"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">手動輸入資料</option>
                                        {systemUsers.map(user => (
                                            <option key={user.userId} value={user.userId}>
                                                {user.userName} ({user.email}) - {user.userRole === 'ADMIN' ? '管理員' : '一般用戶'}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">選擇現有用戶將自動填入姓名和電子郵件</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    姓名 *
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    defaultValue={editingMember?.name || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    職位 *
                                </label>
                                <input
                                    name="position"
                                    type="text"
                                    required
                                    defaultValue={editingMember?.position || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    聯絡電話 *
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    defaultValue={editingMember?.phone || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    電子郵件 *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={editingMember?.email || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    狀態 *
                                </label>
                                <select
                                    name="status"
                                    required
                                    defaultValue={editingMember?.status || 'active'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="active">在職</option>
                                    <option value="on_leave">請假</option>
                                    <option value="inactive">離職</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    專業技能 (用逗號分隔)
                                </label>
                                <input
                                    name="skills"
                                    type="text"
                                    defaultValue={editingMember?.skills?.join(', ') || ''}
                                    placeholder="例如：災難應變, 急救, 通訊設備操作"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMemberForm(false)
                                        setEditingMember(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    {editingMember ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Organizations
