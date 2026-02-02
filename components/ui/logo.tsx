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
      src="/logo.png"
      alt={alt}
      width={500}
      height={500}
      priority={priority}
      className={cn("h-10 w-auto", className)}
    />
  )
}
