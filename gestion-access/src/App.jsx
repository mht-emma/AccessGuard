import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Users from './pages/Users'
import Roles from './pages/Roles'
import Permissions from './pages/Permissions'
import Resources from './pages/Resources'
import IPs from './pages/IPs'
import AccessAttempts from './pages/AccessAttempts'
import Graph from './pages/Graph'
import Forbidden from './pages/Forbidden'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="permissions"
              element={
                <ProtectedRoute>
                  <Permissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="resources"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
            <Route
              path="ips"
              element={
                <ProtectedRoute>
                  <IPs />
                </ProtectedRoute>
              }
            />
            <Route
              path="access-attempts"
              element={
                <ProtectedRoute>
                  <AccessAttempts />
                </ProtectedRoute>
              }
            />
            <Route path="graph" element={<Graph />} />
            <Route path="forbidden" element={<Forbidden />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

