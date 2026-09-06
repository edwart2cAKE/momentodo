import { useState, useRef, useEffect, useLayoutEffect } from 'preact/hooks'
import type { Task, Difficulty, Priority, TaskField, RecurrencePattern } from '../types'
import { TaskEditMenu } from './TaskEditMenu'
import { useMediaQuery, DESKTOP_BREAKPOINT } from '../hooks/useMediaQuery'
import { color, radius, shadow } from '../theme/tokens'

interface TaskEditDropdownProps {
  task: Task
  onSetField: (id: string, field: TaskField, value: number | Difficulty | Priority) => void
  onAddTag?: (id: string, tag: string) => void
  onRemoveTag?: (id: string, tag: string) => void
  availableTags?: string[]
  onAddSubtask?: (parentId: string, title: string) => void
  onSetRecurrence?: (id: string, pattern: RecurrencePattern) => void
  onSetDueDate?: (id: string, date: string | null) => void
}

export function TaskEditDropdown({
  task,
  onSetField,
  onAddTag,
  onRemoveTag,
  availableTags = [],
  onAddSubtask,
  onSetRecurrence,
  onSetDueDate,
}: TaskEditDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleClose = () => setIsOpen(false)

  // Popover positioning (desktop) — useLayoutEffect to avoid flicker
  const [popoverPos, setPopoverPos] = useState<{ top: number; maxH: number }>({ top: 0, maxH: 400 })
  useLayoutEffect(() => {
    if (!isOpen || !isDesktop || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    if (spaceBelow >= spaceAbove) {
      setPopoverPos({ top: rect.bottom + gap, maxH: Math.max(spaceBelow, 200) })
    } else {
      setPopoverPos({ top: Math.max(gap, rect.top - spaceAbove), maxH: Math.max(spaceAbove, 200) })
    }
  }, [isOpen, isDesktop])

  const popoverStyle: preact.CSSProperties = {
    position: 'fixed',
    top: `${popoverPos.top}px`,
    right: `${window.innerWidth - (triggerRef.current?.getBoundingClientRect().right ?? 0)}px`,
    zIndex: 100,
    maxHeight: `${popoverPos.maxH}px`,
  }

  const menuProps = {
    task,
    onSetField,
    onClose: handleClose,
    onAddTag,
    onRemoveTag,
    availableTags,
    onAddSubtask,
    onSetRecurrence,
    onSetDueDate,
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Edit task"
        style={{
          border: 'none',
          background: 'none',
          color: color.inkSoft,
          cursor: 'pointer',
          fontSize: '16px',
          alignSelf: 'center',
          padding: '4px',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        ⋮
      </button>

      {isOpen && isDesktop && (
        <div
          ref={popoverRef}
          style={{
            ...popoverStyle,
            background: color.surface,
            borderRadius: radius.card,
            boxShadow: shadow.momentCardDefault,
            border: `1px solid ${color.line}`,
            width: '280px',
            overflowY: 'auto',
          }}
        >
          <TaskEditMenu {...menuProps} />
        </div>
      )}

      {isOpen && !isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
          }}
        >
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
            }}
          />
          {/* Sheet */}
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: color.surface,
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
              maxHeight: '80vh',
              overflowY: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 0 4px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  borderRadius: '2px',
                  background: color.line,
                }}
              />
            </div>
            <TaskEditMenu {...menuProps} />
          </div>
        </div>
      )}
    </>
  )
}
