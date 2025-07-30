"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ 
    className, 
    value = 0, 
    onChange, 
    max = 5, 
    size = "md", 
    readOnly = false,
    ...props 
  }, ref) => {
    const [hoverValue, setHoverValue] = React.useState(0)
    
    const handleClick = (rating: number) => {
      if (!readOnly && onChange) {
        onChange(rating)
      }
    }
    
    const handleMouseEnter = (rating: number) => {
      if (!readOnly) {
        setHoverValue(rating)
      }
    }
    
    const handleMouseLeave = () => {
      setHoverValue(0)
    }
    
    const effectiveValue = hoverValue || value
    
    return (
      <div 
        ref={ref} 
        className={cn("flex gap-1", className)} 
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= effectiveValue
          
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              disabled={readOnly}
              className={cn(
                "transition-all duration-200",
                !readOnly && "hover:scale-110 cursor-pointer",
                readOnly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-200",
                  isFilled 
                    ? "fill-primary text-primary" 
                    : "fill-transparent text-muted-foreground"
                )}
              />
            </button>
          )
        })}
      </div>
    )
  }
)
StarRating.displayName = "StarRating"

export { StarRating }