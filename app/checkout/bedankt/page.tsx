import { Suspense } from 'react'
import BedanktContent from './BedanktContent'

export default function BedanktPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontSize: 22, color: '#4A7C3F' }}>
        🐾 Even laden...
      </div>
    }>
      <BedanktContent />
    </Suspense>
  )
}
