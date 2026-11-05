import { CHARACTERS } from './Character'

// window.confirm はアプリ内ブラウザなどで表示されず常にキャンセル扱いになることがあるため、自前で出す
export function ConfirmDialog({
  message,
  confirmLabel = '削除する',
  onConfirm,
  onCancel,
}: {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-character">
          <img src={CHARACTERS.giroro.src} alt="" width={72} height={72} />
          <div>
            <p className="dialog-quote">「本当にいいのか…？」</p>
            <p>{message}</p>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
