/**
 * ConfirmDialog.tsx
 * 确认对话框组件
 *
 * 功能:
 * - 显示确认/取消对话框
 * - 支持自定义标题和内容
 */

import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
