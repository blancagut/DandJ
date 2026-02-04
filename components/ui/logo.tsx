import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  alt?: string
  priority?: boolean
}

export function Logo({
  className,
  alt = "Diaz & Johnson - Migration Advocates",
  priority,
}: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={260}
      height={60}
      priority={priority}
      className={cn("h-10 w-auto object-contain", className)}
    />
  )
}
