'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CrewCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if we're not on the login or register page
    const isAuthPage = pathname === '/crew-center/login' || pathname === '/crew-center/register'
    
    if (!loading && !user && !isAuthPage && !isRedirecting) {
      setIsRedirecting(true)
      router.replace('/crew-center/login')
    }
  }, [user, loading, router, isRedirecting, pathname])

  // Show loading screen while checking authentication
  if (loading || (isRedirecting && !user)) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

