'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Crew Center Error:', error)
  }, [error])

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
        <p className="text-gray-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/crew-center')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

