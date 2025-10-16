import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId="439973197443-n67b6hjl30jmhm8mp14obtln94gvckcb.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
)
