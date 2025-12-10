'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Logo() {
  const router = useRouter()
  
  return (
    <button
      type="button"
      onClick={() => router.push('/')}
      className="flex items-center group cursor-pointer"
    >
      <Image
        src="/AMVA-Logo.png"
        alt="Mexico Virtual Logo"
        width={200}
        height={80}
        className="h-12 w-auto object-contain"
        priority
      />
    </button>
  )
}

