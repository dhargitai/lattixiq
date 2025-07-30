"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  showPercentage?: boolean
  sticky?: boolean
}

const ProgressHeader = React.forwardRef<HTMLDivElement, ProgressHeaderProps>(
  ({ className, value, showPercentage = true, sticky = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const lastScrollY = React.useRef(0)
    
    React.useEffect(() => {
      if (!sticky) return
      
      const handleScroll = () => {
        const currentScrollY = window.scrollY
        
        // Show when scrolling up or at the top
        if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
        
        lastScrollY.current = currentScrollY
      }
      
      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }, [sticky])
    
    return (
      <div
        ref={ref}
        className={cn(
          "transition-transform duration-300 bg-background/80 backdrop-blur-sm border-b",
          sticky && "fixed top-0 left-0 right-0 z-30",
          sticky && !isVisible && "-translate-y-full",
          className
        )}
        {...props}
      >
        <div className="relative">
          <Progress 
            value={value} 
            className="h-1 rounded-none" 
          />
          {showPercentage && (
            <div className="absolute right-4 top-2 text-xs font-medium text-muted-foreground">
              {Math.round(value)}%
            </div>
          )}
        </div>
      </div>
    )
  }
)
ProgressHeader.displayName = "ProgressHeader"

export { ProgressHeader }