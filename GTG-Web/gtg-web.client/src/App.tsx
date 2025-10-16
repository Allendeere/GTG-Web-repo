
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import Dashboard from './pages/Dashboard'
import ProjectOverview from './pages/ProjectOverview'
import Organizations from './pages/Organizations'
import Supplies from './pages/Supplies'
import MachineModules from './pages/MachineModules'
import SpiritualSupport from './pages/SpiritualSupport'
import ProjectTasks from './pages/ProjectTasks'
import UserSettings from './pages/UserSettings'
import Notifications from './pages/Notifications'

function App() {
    return (
        <Router>
            <div className="App">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            style: {
                                background: '#10B981',
                            },
                        },
                        error: {
                            style: {
                                background: '#EF4444',
                            },
                        },
                    }}
                />

                <AuthGuard>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/overview" element={<ProjectOverview />} />
                            <Route path="/organizations" element={<Organizations />} />
                            <Route path="/supplies" element={<Supplies />} />
                            <Route path="/machine-modules" element={<MachineModules />} />
                            <Route path="/spiritual-support" element={<SpiritualSupport />} />
                            <Route path="/project-tasks" element={<ProjectTasks />} />
                            <Route path="/settings" element={<UserSettings />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                </AuthGuard>
            </div>
        </Router>
    )
}

export default App
