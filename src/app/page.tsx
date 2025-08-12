"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, ExternalLink, Sparkles, Zap, Star, Download, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AutomaticBookCover from "@/components/AutomaticBookCover"

interface Book {
  id: string
  title: string
  author: string
  publisher?: string
  year?: string
  isbn?: string
  coverUrl?: string
  description?: string
  size?: string
  date?: string
  language?: string
  fileType?: string
  instantDownload?: boolean
  downloadLinks?: Array<{
    server: string
    url: string
  }>
  originalUrl?: string
}

interface BookCardProps {
  book: Book
  onClick: () => void
}

function BookCard({ book, onClick }: BookCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showActualCover, setShowActualCover] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    setShowActualCover(false)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setShowActualCover(true)
  }

  // Start loading the actual cover immediately but don't show it until loaded
  useEffect(() => {
    if (book.coverUrl && !imageError) {
      const img = new Image()
      img.onload = handleImageLoad
      img.onerror = handleImageError
      img.src = book.coverUrl
    }
  }, [book.coverUrl, imageError])

  return (
    <Card 
      className={`book-card-hover relative overflow-hidden group cursor-pointer bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-lg hover:shadow-2xl`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Instant Download Badge */}
      {book.instantDownload && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
            <Download className="w-3 h-3 mr-1" />
            Instant
          </Badge>
        </div>
      )}
      
      {/* Floating action button */}
      <div className={`absolute top-3 left-3 z-20 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden shadow-inner relative">
          {book.coverUrl && !imageError && showActualCover ? (
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AutomaticBookCover 
                title={book.title} 
                author={book.author}
                className="w-full h-full"
              />
            </div>
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3 relative z-10 px-4 pb-4">
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight">
            {book.title}
          </CardTitle>
          <CardDescription className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
            {book.author}
          </CardDescription>
        </div>
        
        {/* Metadata badges */}
        <div className="flex flex-wrap gap-1.5">
          {book.language && (
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              {book.language}
            </Badge>
          )}
          {book.fileType && (
            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
              {book.fileType}
            </Badge>
          )}
          {book.year && (
            <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              {book.year}
            </Badge>
          )}
        </div>
        
        {/* Size and server info */}
        {book.size && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {book.size}
          </p>
        )}
        
        {/* Server indicators */}
        {book.downloadLinks && book.downloadLinks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Available on:</p>
            <div className="flex flex-wrap gap-1">
              {book.downloadLinks.slice(0, 3).map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-center gap-1 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    link.server === 'lgli' || link.server === 'lgrs' 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {link.server}
                  </span>
                </div>
              ))}
              {book.downloadLinks.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{book.downloadLinks.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Open link indicator */}
        <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Download className="w-3 h-3" />
          <span>Download Book</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearchEnabled, setIsSearchEnabled] = useState(true)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = async () => {
    console.log('Search initiated, query:', searchQuery)
    if (!searchQuery.trim()) {
      console.log('Empty search query, returning')
      return
    }

    // Disable search temporarily to prevent multiple clicks
    setIsSearchEnabled(false)
    setLoading(true)
    setError(null)
    setBooks([])

    try {
      console.log('Making API request to /api/search-simple...')
      const response = await fetch("/api/search-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      console.log('API response status:', response.status)
      
      if (!response.ok) {
        throw new Error("Failed to search books")
      }

      const data = await response.json()
      console.log('API response data:', data)
      setBooks(data.books || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      // Re-enable search after a short delay
      setTimeout(() => setIsSearchEnabled(true), 1000)
    }
  }

  const handleBookClick = (book: Book) => {
    if (book.id) {
      window.open(`/download/${book.id}`, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <BookOpen className="h-10 w-10 text-gradient" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                BookVault
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover millions of books from Anna's Archive with our intelligent search engine
            </p>
          </div>
          
          {/* Enhanced Search Form */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative flex gap-3 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <Input
                  type="text"
                  placeholder="Search for books, authors, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`flex-1 border-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg search-glow rounded-xl ${isFocused ? 'ring-2 ring-purple-500/50' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
                <Button 
                  disabled={!isSearchEnabled || loading || !searchQuery.trim()}
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search
                    </div>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Search suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Programming', 'Science Fiction', 'Machine Learning', 'Philosophy', 'History'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12">
        {error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Search Error</h3>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <Button 
                  onClick={() => setError(null)}
                  variant="outline"
                  className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex flex-col bg-white dark:bg-gray-900 border-0 shadow-lg overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-64 w-full rounded-xl loading-skeleton" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4 px-4 pb-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4 loading-skeleton" />
                    <Skeleton className="h-3 w-1/2 loading-skeleton" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 loading-skeleton rounded-full" />
                    <Skeleton className="h-6 w-20 loading-skeleton rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {books.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Search Results
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Found {books.length} book{books.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                {books.length} books
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && books.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-3xl p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-full">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We couldn't find any books matching "{searchQuery}". Try different keywords or check your spelling.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Fiction', 'Technology', 'Business', 'Biography'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchQuery(suggestion)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/40"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && books.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-3xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 shadow-2xl">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-3xl floating">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Welcome to BookVault
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Your gateway to millions of books from Anna's Archive collection
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-2xl mb-3">
                        <Search className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Smart Search</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Find books by title, author, or ISBN</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-pink-100 dark:bg-pink-900/20 p-4 rounded-2xl mb-3">
                        <Download className="w-8 h-8 text-pink-600 dark:text-pink-400 mx-auto" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Instant Access</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download from multiple servers</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-2xl mb-3">
                        <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Verified Links</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reliable download sources</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter a book title, author, or keyword above to get started
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Powered by Anna's Archive • Built with Next.js & Tailwind CSS
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Search millions of books instantly
            </p>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes tilt {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          50% { transform: rotate(-1deg); }
          75% { transform: rotate(1deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-tilt {
          animation: tilt 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}