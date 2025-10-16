
import React from 'react'
import { Target, Users, Package, Zap, Heart, Globe, Lightbulb, Shield } from 'lucide-react'

const ProjectOverview: React.FC = () => {
    return (
        <div className="p-6 space-y-8">
            {/* 專案標題與簡介 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
                <div className="flex items-center mb-6">
                    <Globe className="w-8 h-8 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">計畫目標</h2>
                </div>

                <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        GTG計畫（Green Technology for Global crisis）致力於建立一個創新的智能農業與危機應對解決方案，
                        結合微藻共生池技術與應急糧食系統，為面臨氣候變遷與糧食安全挑戰的世界提供可持續的解決方案。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-3">
                                <Lightbulb className="w-6 h-6 text-yellow-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800">創新技術</h3>
                            </div>
                            <p className="text-gray-600">
                                運用微藻共生池技術，結合AI智能監控系統，實現高效率的糧食生產與環境保護的雙重目標。
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-3">
                                <Shield className="w-6 h-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800">危機應對</h3>
                            </div>
                            <p className="text-gray-600">
                                建立完整的應急糧食系統與災難應變機制，確保在各種危機情況下都能維持基本的糧食供應。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 三大核心層面 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 組織層面 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                        <div className="flex items-center mb-3">
                            <Users className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-bold">組織層面</h3>
                        </div>
                        <p className="text-blue-100">
                            建立完整的組織架構與團隊協作機制
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">災難應變指揮中心</h4>
                                <p className="text-gray-600 text-sm">統籌指揮與決策制定</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">通訊聯絡組</h4>
                                <p className="text-gray-600 text-sm">維持內外部溝通管道</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">農業研究團隊</h4>
                                <p className="text-gray-600 text-sm">技術研發與系統優化</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">管理團隊</h4>
                                <p className="text-gray-600 text-sm">日常營運與資源調配</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 物資層面 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                        <div className="flex items-center mb-3">
                            <Package className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-bold">物資層面</h3>
                        </div>
                        <p className="text-green-100">
                            完整的物資管理與供應鏈系統
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">糧食儲備</h4>
                                <p className="text-gray-600 text-sm">應急糧食與營養補給</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">生產設備</h4>
                                <p className="text-gray-600 text-sm">微藻培養與加工設備</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">培養液系統</h4>
                                <p className="text-gray-600 text-sm">植物培養液與營養配方</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">淨水設備</h4>
                                <p className="text-gray-600 text-sm">水質處理與循環系統</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 精神層面 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                        <div className="flex items-center mb-3">
                            <Heart className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-bold">精神層面</h3>
                        </div>
                        <p className="text-purple-100">
                            社區支持與精神關懷系統
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">社區支持系統</h4>
                                <p className="text-gray-600 text-sm">建立互助與關懷網絡</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">聖經經文分享</h4>
                                <p className="text-gray-600 text-sm">每日靈修與信仰支持</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">禱告會</h4>
                                <p className="text-gray-600 text-sm">定期禱告與團契活動</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div>
                                <h4 className="font-semibold text-gray-800">心理輔導</h4>
                                <p className="text-gray-600 text-sm">專業心理支持服務</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 技術架構 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                    <Zap className="w-8 h-8 text-yellow-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">技術架構</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lightbulb className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">照明模塊</h4>
                        <p className="text-gray-600 text-sm">智能LED照明系統</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">電力模塊</h4>
                        <p className="text-gray-600 text-sm">可再生能源供電</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">AI影像</h4>
                        <p className="text-gray-600 text-sm">智能監控與分析</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">恆溫模塊</h4>
                        <p className="text-gray-600 text-sm">環境溫度控制</p>
                    </div>
                </div>
            </div>

            {/* 實施階段 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-8">
                <div className="flex items-center mb-6">
                    <Target className="w-8 h-8 text-indigo-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-800">實施階段</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-bold">1</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">研發階段</h4>
                        </div>
                        <p className="text-gray-600">
                            完成技術研發、系統設計與原型測試，建立基礎技術架構。
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-bold">2</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">試點階段</h4>
                        </div>
                        <p className="text-gray-600">
                            在選定區域進行小規模試點，驗證系統可行性與效果。
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-indigo-600 font-bold">3</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">推廣階段</h4>
                        </div>
                        <p className="text-gray-600">
                            擴大實施範圍，建立完整的營運體系與可持續發展模式。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectOverview
