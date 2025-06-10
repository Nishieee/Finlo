"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface DraggableSplitterProps {
  direction: "horizontal" | "vertical"
  initialPosition?: number
  minPosition?: number
  maxPosition?: number
  onPositionChange?: (position: number) => void
  storageKey?: string
  className?: string
}

export function DraggableSplitter({
  direction,
  initialPosition = 50,
  minPosition = 30,
  maxPosition = 70,
  onPositionChange,
  storageKey,
  className,
}: DraggableSplitterProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const splitterRef = useRef<HTMLDivElement>(null)

  // Load position from localStorage on mount
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const savedPosition = Number.parseFloat(saved)
        if (savedPosition >= minPosition && savedPosition <= maxPosition) {
          setPosition(savedPosition)
        }
      }
    }
  }, [storageKey, minPosition, maxPosition])

  // Save position to localStorage when it changes
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, position.toString())
    }
    onPositionChange?.(position)
  }, [position, storageKey, onPositionChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !splitterRef.current) return

      const container = splitterRef.current.parentElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      let newPosition: number

      if (direction === "horizontal") {
        newPosition = ((e.clientX - rect.left) / rect.width) * 100
      } else {
        newPosition = ((e.clientY - rect.top) / rect.height) * 100
      }

      // Snap to 25% increments if close
      const snapPoints = [25, 50, 75]
      const snapThreshold = 2
      for (const snap of snapPoints) {
        if (Math.abs(newPosition - snap) < snapThreshold) {
          newPosition = snap
          break
        }
      }

      newPosition = Math.max(minPosition, Math.min(maxPosition, newPosition))
      setPosition(newPosition)
    },
    [isDragging, direction, minPosition, maxPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction])

  return (
    <div
      ref={splitterRef}
      className={cn(
        "bg-border hover:bg-border/80 transition-colors",
        direction === "horizontal" ? "w-1 cursor-col-resize hover:w-2" : "h-1 cursor-row-resize hover:h-2",
        isDragging && (direction === "horizontal" ? "w-2" : "h-2"),
        className,
      )}
      onMouseDown={handleMouseDown}
      style={{
        [direction === "horizontal" ? "left" : "top"]: `${position}%`,
        transform: direction === "horizontal" ? "translateX(-50%)" : "translateY(-50%)",
        position: "absolute",
        zIndex: 10,
        [direction === "horizontal" ? "height" : "width"]: "100%",
      }}
      aria-label={`Resize ${direction} splitter`}
      role="separator"
      aria-orientation={direction}
    />
  )
}
