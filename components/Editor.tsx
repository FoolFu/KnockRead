import { forwardRef } from 'react'

const Editor = forwardRef<HTMLDivElement, { className?: string }>(function Editor({ className }, ref) {
  return (
    <div
      ref={ref}
      contentEditable
      className={`min-h-[60vh] outline-none ${className || ''}`}
      suppressContentEditableWarning
    />
  )
})

export default Editor
