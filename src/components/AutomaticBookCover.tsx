"use client"

import { useMemo } from "react"

interface AutomaticBookCoverProps {
  title: string
  author?: string
  className?: string
}

// Simple color palettes using inline styles
const COLOR_PALETTES = [
  {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    text: "#ffffff",
    border: "#ffffff"
  },
  {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    text: "#ffffff", 
    border: "#ffffff"
  },
  {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    text: "#ffffff",
    border: "#ffffff"
  },
  {
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    text: "#ffffff",
    border: "#ffffff"
  },
  {
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    text: "#ffffff",
    border: "#ffffff"
  },
  {
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    text: "#333333",
    border: "#333333"
  },
  {
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    text: "#333333",
    border: "#333333"
  },
  {
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    text: "#333333",
    border: "#333333"
  },
  {
    background: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
    text: "#333333",
    border: "#333333"
  },
  {
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    text: "#ffffff",
    border: "#ffffff"
  }
]

// Generate consistent color based on title
function generateColorPalette(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % COLOR_PALETTES.length
  return COLOR_PALETTES[index]
}

// Function to calculate responsive font size based on title length and number of lines
function calculateFontSize(titleLines: string[], containerWidth: number = 200): { titleSize: string; authorSize: string } {
  const totalChars = titleLines.join(' ').length
  const maxLineLength = Math.max(...titleLines.map(line => line.length))
  const lineHeight = titleLines.length
  
  // Base sizes in rem
  let titleSize = 1.1
  let authorSize = 0.75
  
  // Adjust based on number of lines
  if (lineHeight === 1) {
    // Single line - can be larger
    titleSize = totalChars > 30 ? 0.9 : totalChars > 20 ? 1.0 : 1.2
  } else if (lineHeight === 2) {
    // Two lines - moderate size
    titleSize = maxLineLength > 25 ? 0.7 : maxLineLength > 18 ? 0.8 : 0.9
  } else {
    // Three lines - smaller size
    titleSize = maxLineLength > 20 ? 0.6 : maxLineLength > 15 ? 0.7 : 0.8
  }
  
  // Adjust based on container width (responsive)
  if (containerWidth < 150) {
    titleSize *= 0.8
    authorSize *= 0.9
  } else if (containerWidth > 250) {
    titleSize *= 1.1
    authorSize *= 1.1
  }
  
  // Ensure minimum sizes
  titleSize = Math.max(titleSize, 0.6)
  authorSize = Math.max(authorSize, 0.6)
  
  return {
    titleSize: `${titleSize}rem`,
    authorSize: `${authorSize}rem`
  }
}

// Function to wrap text for better display with adaptive line length
function wrapText(text: string, maxCharsPerLine: number = 12): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      if (currentLine === '') {
        currentLine = word
      } else {
        currentLine += ' ' + word
      }
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // Word is too long, split it
        lines.push(word.substring(0, maxCharsPerLine))
        currentLine = word.substring(maxCharsPerLine)
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines.slice(0, 3) // Max 3 lines
}

export default function AutomaticBookCover({ title, author, className = "" }: AutomaticBookCoverProps) {
  const palette = useMemo(() => generateColorPalette(title), [title])
  const titleLines = useMemo(() => wrapText(title), [title])
  const fontSizes = useMemo(() => calculateFontSize(titleLines), [titleLines])
  
  return (
    <div 
      className={`relative w-full h-full flex flex-col justify-between p-3 ${className}`}
      style={{
        background: palette.background,
        color: palette.text
      }}
    >
      {/* Simple border */}
      <div 
        className="absolute inset-1 border-2 rounded-sm"
        style={{ borderColor: palette.border, opacity: 0.6 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center text-center">
        {/* Title */}
        <div className="space-y-1">
          {titleLines.map((line, index) => (
            <div 
              key={index}
              style={{
                fontSize: fontSizes.titleSize,
                fontWeight: 'bold',
                lineHeight: '1.1',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                letterSpacing: titleLines.length > 2 ? '-0.02em' : 'normal'
              }}
            >
              {line}
            </div>
          ))}
        </div>
        
        {/* Author */}
        {author && (
          <div 
            style={{
              fontSize: fontSizes.authorSize,
              fontStyle: 'italic',
              marginTop: '0.4rem',
              opacity: 0.9,
              lineHeight: '1.2'
            }}
          >
            {author.length > 25 ? author.substring(0, 25) + '...' : author}
          </div>
        )}
      </div>
      
      {/* Book icon at bottom */}
      <div 
        className="text-center"
        style={{
          fontSize: '1rem',
          opacity: 0.7,
          marginTop: '0.3rem'
        }}
      >
        📖
      </div>
    </div>
  )
}