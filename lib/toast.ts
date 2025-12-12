import { toast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    })
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    })
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 3500,
    })
  },
  
  loading: (message: string) => {
    return toast.loading(message)
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}
