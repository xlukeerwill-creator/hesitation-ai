import { useState, useEffect } from 'react'
import Store from './Store'
import Dashboard from './Dashboard'

function App() {
  const [view, setView] = useState('store')

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash
      if (hash === '#dashboard') setView('dashboard')
      else setView('store')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const goToStore = () => {
    window.location.hash = ''
    setView('store')
  }

  const goToDashboard = () => {
    window.location.hash = 'dashboard'
    setView('dashboard')
  }

  return (
    <div>
      {view === 'store' && <Store onSwitchView={goToDashboard} />}
      {view === 'dashboard' && <Dashboard onSwitchView={goToStore} />}
    </div>
  )
}

export default App