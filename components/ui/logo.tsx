import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.ComponentProps<"svg"> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 60"
      fill="none"
      className={cn("h-10 w-auto", className)}
      {...props}
    >
      {/* Icon: Abstract Column/Scales/Shield */}
      <path
        d="M30 10 L50 20 L50 45 C50 50 40 55 30 55 C20 55 10 50 10 45 L10 20 L30 10 Z"
        className="opacity-20"
        fill="currentColor"
      />
      <path
        d="M30 12 L46 20 V44 C46 47 38 51 30 51 C22 51 14 47 14 44 V20 L30 12 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 24 L38 24 M30 24 V44 M22 28 L38 28 M22 24 L20 40 M38 24 L40 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Text: Diaz & Johnson */}
      <text
        x="60"
        y="34"
        fontFamily="Times New Roman, serif"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
        className="tracking-wide"
      >
        DIAZ &amp; JOHNSON
      </text>

      {/* Subtext: Migration Advocates */}
      <text
        x="62"
        y="50"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        letterSpacing="2.5"
        fill="currentColor"
        className="opacity-80"
      >
        MIGRATION ADVOCATES
      </text>
    </svg>
  )
}
