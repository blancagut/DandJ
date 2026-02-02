import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.ComponentProps<"svg"> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 60"
      fill="none"
      className={cn("h-10 w-auto", className)}
      {...props}
    >
      {/* Icon: DJ monogram (clean, scalable, no font dependency) */}
      <rect
        x="10"
        y="10"
        width="40"
        height="40"
        rx="12"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-80"
      />
      <path
        d="M18 20 H42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-80"
      />
      <circle cx="30" cy="20" r="2" fill="currentColor" className="opacity-80" />

      {/* D */}
      <path
        d="M20 26 V44 M20 26 H28 A8 9 0 0 1 28 44 H20"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* J */}
      <path
        d="M40 26 V38 C40 42 37 44 33 44 C30 44 28 42 28 40"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text: Diaz & Johnson */}
      <text
        x="64"
        y="34"
        fontFamily="ui-serif, Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="1"
      >
        DIAZ &amp; JOHNSON
      </text>

      {/* Subtext: Migration Advocates */}
      <text
        x="64"
        y="50"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        fontSize="9"
        fontWeight="700"
        letterSpacing="3"
        fill="currentColor"
        className="opacity-70"
      >
        MIGRATION ADVOCATES
      </text>
    </svg>
  )
}
