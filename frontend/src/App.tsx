import { BrowserRouter, Route, Routes} from 'react-router';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ChatAppPage from './pages/ChatAppPage'
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useThemeStore } from './stores/useThemeStore';
import { useEffect } from 'react';
function App() {
  const { isDark, setTheme } = useThemeStore();
  useEffect(() => {setTheme(isDark)}, [isDark, setTheme]);
   
  return (
    <>
      <Toaster richColors/>
      <BrowserRouter>
        <Routes>
        {/* public routes here */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          {/* Protected routes here */}
          <Route element={<ProtectedRoute/>}>
            <Route
              path='/'
              element={<ChatAppPage/>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
