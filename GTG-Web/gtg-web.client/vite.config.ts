import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// 專案名稱（GitHub Repo 名稱）
const repoName = 'GTG-Web-repo'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    let build: UserConfig['build'], esbuild: UserConfig['esbuild'], define: UserConfig['define']

    if (mode === 'development') {
        build = {
            minify: false,
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                },
            },
        }

        esbuild = {
            jsxDev: true,
            keepNames: true,
            minifyIdentifiers: false,
        }

        define = {
            'process.env.NODE_ENV': '"development"',
            '__DEV__': 'true',
        }
    } else {
        // production 模式
        build = {
            outDir: 'docs',           // 編譯輸出到 docs
            sourcemap: false,
        }

        define = {
            'process.env.NODE_ENV': '"production"',
        }
    }

    return {
        base: `/${repoName}/`, // GitHub Pages 靜態資源路徑
        plugins: [react()],
        build,
        esbuild,
        define,
        resolve: {
            alias: {
                '@': '/src',
            },
        },
        optimizeDeps: {
            exclude: ['lucide-react'],
        },
    }
})
