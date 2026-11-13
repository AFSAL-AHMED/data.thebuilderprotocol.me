import React from 'react'
import Modal from './Modal'
import Button, { type ButtonVariant } from './Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonVariant
  isLoading?: boolean
  icon?: React.ReactNode
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'gold',
  isLoading = false,
  icon,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      closeOnOverlayClick={!isLoading}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        {icon && (
          <div className="shrink-0 text-amber-600 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-base font-semibold text-[#1A1A1A] mb-2">{title}</h4>
          <div className="text-sm text-[#6B7280]">{message}</div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
