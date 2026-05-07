import Sidebar from '@/components/Sidebar'
import { AlertProvider } from '@/components/Alert'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </AlertProvider>
  )
}
