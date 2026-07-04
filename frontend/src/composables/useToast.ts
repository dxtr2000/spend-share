import { readonly, ref } from 'vue'

interface ToastMessage {
  id: string
  title: string
  description?: string
}

const toasts = ref<ToastMessage[]>([])

export function useToast() {
  function showToast(message: Omit<ToastMessage, 'id'>) {
    const id = crypto.randomUUID()
    toasts.value = [...toasts.value, { id, ...message }]

    window.setTimeout(() => {
      dismissToast(id)
    }, 3600)
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    dismissToast,
    showToast,
    toasts: readonly(toasts)
  }
}
