import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function bootstrap() {
  // Start MSW worker: enabled by default for demo/production deployment unless explicitly set to 'false'
  const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== 'false';
  if (mocksEnabled) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: false,
    } as any)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
