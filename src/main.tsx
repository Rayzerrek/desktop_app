import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://1a5d8d34a6083b709af9ed5022441af1@o4510335991152640.ingest.de.sentry.io/4510346394861648',
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
