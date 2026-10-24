import { RouterProvider } from 'react-router-dom'
import { router } from '@/lib/router'
import { useFollowSystemTheme } from '@/features/preferences/usePreferences'

function App() {
  useFollowSystemTheme()
  return <RouterProvider router={router} />
}

export default App
