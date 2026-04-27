import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <App />
            <ToastContainer />
        </AuthProvider>
    </BrowserRouter>
)
