"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

interface CountUpProps {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  decimals?: number
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 2,
  className = "",
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration: duration * 1000,
  })
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [displayValue, setDisplayValue] = useState(prefix + "0" + suffix)

  useEffect(() => {
    if (isInView) {
      motionValue.set(to)
    }
  }, [isInView, motionValue, to])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      const formatted = latest.toFixed(decimals)
      setDisplayValue(`$${prefix}${formatted}${suffix}`.replace('$$','$')) // Ensure no double prefix if included in state
    })
  }, [springValue, decimals, prefix, suffix])

  // Need to handle the display string construction carefully to avoid hydration mismatch/double rendering
  // Simplified approach: update text content via ref if possible, or state
  useEffect(() => {
    const unsub = springValue.on("change", (latest) => {
      if (ref.current) {
        // Format with local string if needed, or just basic toFixed
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`
      }
    })
    return unsub
  }, [springValue, decimals, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
