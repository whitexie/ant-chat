import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { scan } from 'react-scan'

import router from './routers/index.tsx'
import '@ant-design/v5-patch-for-react-19'
import './index.css'

if(import.meta.env.DEV) {
  scan({
    enabled: true,
  })
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
