import { useState } from 'react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import axios from 'axios'

interface User {
    email: string
    name: string
    picture: string
    accessToken: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    const signIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true)

                // 取用戶資訊
                const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })

                const newUser: User = {
                    email: data.email,
                    name: data.name,
                    picture: data.picture,
                    accessToken: tokenResponse.access_token,
                }

                setUser(newUser)
                localStorage.setItem('user', JSON.stringify(newUser))
            } catch (error) {
                console.error('取得使用者資訊失敗:', error)
            } finally {
                setLoading(false)
            }
        },
        onError: (error) => {
            console.error('Google 登入失敗:', error)
            setLoading(false)
        },
    })

    const signOut = () => {
        googleLogout()
        setUser(null)
        localStorage.removeItem('user')
    }

    return {
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signOut,
    }
}
