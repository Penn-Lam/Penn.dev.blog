import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton={false}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background-primary-default group-[.toaster]:text-text-primary group-[.toaster]:border-border-button-default group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-text-secondary',
          actionButton: 'group-[.toast]:bg-button-primary group-[.toast]:text-text-white',
          cancelButton: 'group-[.toast]:bg-background-secondary-default group-[.toast]:text-text-secondary'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
