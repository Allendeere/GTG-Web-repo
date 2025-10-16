import { useState, useEffect } from 'react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import axios from 'axios'
import { supabase } from "../lib/supabaseClient"
interface User {
    id?: string
    email: string
    name: string
    picture: string
    accessToken: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    // 嘗試從 localStorage 載入登入狀態
    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        if (savedUser) setUser(JSON.parse(savedUser))
    }, [])

    const signIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);

                // 1️⃣ 從 Google 取得使用者資料
                const { data } = await axios.get('https://lvxzewfxhodndvvajmcg.supabase.co/auth/v1/callback', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                const googleUser: User = {
                    email: data.email,
                    name: data.name,
                    picture: data.picture, // Google 頭像
                    accessToken: tokenResponse.access_token,
                };

                // 2️⃣ 透過 Supabase 登入 / 建立 session
                const { data: sessionData, error: signInError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                });

                if (signInError) throw signInError;

                // 3️⃣ 取得 Supabase auth 使用者資料
                const { data: supabaseUserData, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                console.log('Supabase 登入使用者:', supabaseUserData.user);

                // 4️⃣ 檢查 Supabase users 表是否已有該帳號
                const { data: existing, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', googleUser.email)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('Supabase 查詢錯誤:', fetchError);
                    throw fetchError;
                }

                // 5️⃣ 若存在則使用資料庫內的資料（可能頭像已被修改）
                let finalUser: User;

                if (existing) {
                    finalUser = {
                        ...googleUser,
                        id: existing.id,
                        picture: existing.picture || googleUser.picture,
                    };
                } else {
                    // 6️⃣ 若不存在，建立新用戶
                    const { data: inserted, error: insertError } = await supabase
                        .from('users')
                        .insert([
                            {
                                email: googleUser.email,
                                name: googleUser.name,
                                picture: googleUser.picture,
                            },
                        ])
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    finalUser = { ...googleUser, id: inserted.id };
                }

                // 7️⃣ 更新前端狀態與 localStorage
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));

            } catch (error) {
                console.error('登入或同步失敗:', error);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google 登入失敗:', error);
            setLoading(false);
        },
    });

    const signOut = async () => {
        try {
            setLoading(true)
            googleLogout()
        } catch (error) {
            console.error('登出失敗:', error)
            setLoading(false)
        }
    }
    // 🔄 提供更新頭像功能
    const updateAvatar = async (newPictureUrl: string) => {
        if (!user?.email) return

        const { error } = await supabase
            .from('users')
            .update({ picture: newPictureUrl })
            .eq('email', user.email)

        if (error) {
            console.error('更新頭像失敗:', error)
            return
        }

        const updatedUser = { ...user, picture: newPictureUrl }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return {
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signOut,
        updateAvatar, // 新增：更新頭像
    }
}
