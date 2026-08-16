import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/helpers/classnames'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  variant?: ToastVariant
  onDismiss: () => void
  duration?: number
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-success-600 text-white',
  error: 'bg-danger-600 text-white',
  info: 'bg-slate-800 text-white',
}

export function Toast({
  message,
  variant = 'info',
  onDismiss,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
        variantStyles[variant]
      )}
    >
      {message}
    </motion.div>
  )
}