
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'

interface User {
    projectId: string
    userId: string
    email: string
    userName: string
    userRole: 'ADMIN' | 'USER'
    createdTime: string
    accessToken: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(lumi.auth.user)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // 檢查現有會話
        const checkSession = () => {
            const existingUser = lumi.auth.user
            const isLoggedIn = lumi.auth.isAuthenticated

            if (isLoggedIn && existingUser) {
                setUser(existingUser)
            }
        }

        checkSession()

        // 監聽認證狀態變化
        const unsubscribe = lumi.auth.onAuthChange((user: User | null) => {
            setUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const signIn = async () => {
        try {
            setLoading(true)
            await lumi.auth.signIn()
        } catch (error) {
            console.error('登入失敗:', error)
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            await lumi.auth.signOut()
        } catch (error) {
            console.error('登出失敗:', error)
            setLoading(false)
        }
    }

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.userRole === 'ADMIN',
        isUser: user?.userRole === 'USER',
        loading,
        signIn,
        signOut
    }
}
