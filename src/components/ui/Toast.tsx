'use client'

import { useEffect, useState } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bg = type === 'success'
    ? 'bg-green-900/40 border-green-800 text-green-400'
    : 'bg-red-900/40 border-red-800 text-red-400'

  return (
    <div
      className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all duration-300 ${bg} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      {message}
    </div>
  )
}
