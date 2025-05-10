// This file is the entry point for the React application.
// It sets up the React application and renders the main App component into the root element of the HTML document.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)