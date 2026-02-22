'use client'

import { useEffect, useRef } from 'react'

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
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
