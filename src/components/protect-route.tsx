"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate();

  useEffect(() => {
    console.log("currentUser", currentUser)
    if (!loading && !currentUser) {
      navigate("/login")
    }
  }, [currentUser, loading, navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin" />
      </div>
    )
  }

  return currentUser ? <>{children}</> : null
}

