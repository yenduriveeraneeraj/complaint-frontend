/**
 * main.jsx — React Application Entry Point
 *
 * This file is the STARTING POINT of our React app.
 * It connects the React app to the HTML <div id="root">
 * and wraps the app with necessary providers.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap CSS — for responsive layout and components
import 'bootstrap/dist/css/bootstrap.min.css'

// Global custom styles
import './index.css'

// Root App component
import App from './App.jsx'

// Find the <div id="root"> in index.html and render our React app inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
