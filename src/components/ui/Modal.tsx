'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-glass-bg border border-glass-border backdrop-blur-md rounded-2xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {title && (
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xl font-heading font-semibold text-white tracking-tight">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
