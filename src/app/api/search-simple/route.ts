import { type NextRequest, NextResponse } from "next/server"

interface ExtractionResult {
  success: boolean
  sourceCode?: string
  error?: string
  size?: string
  title?: string
  method?: string
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

// Helper function to extract title from HTML
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : "Unknown Title"
}

// Helper function to clean and format HTML
function cleanHtml(html: string): string {
  // Remove excessive whitespace but maintain structure
  return html
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .trim()
}

// Method 1: Enhanced fetch with anti-bot headers
async function fetchWithStandardHeaders(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'DNT': '1',
        'Referer': 'https://www.google.com/',
      },
      signal: AbortSignal.timeout(20000), // Increased timeout
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const html = await response.text()
    const cleanedHtml = cleanHtml(html)
    
    return {
      success: true,
      sourceCode: cleanedHtml,
      size: Buffer.byteLength(cleanedHtml, 'utf8').toString(),
      title: extractTitle(html),
      method: 'Enhanced Standard Fetch'
    }
  } catch (error) {
    return {
      success: false,
      error: `Enhanced standard fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Enhanced Standard Fetch'
    }
  }
}

// Method 2: Simple fetch without special headers
async function fetchSimple(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // Shorter timeout for simple fetch
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const html = await response.text()
    const cleanedHtml = cleanHtml(html)
    
    return {
      success: true,
      sourceCode: cleanedHtml,
      size: Buffer.byteLength(cleanedHtml, 'utf8').toString(),
      title: extractTitle(html),
      method: 'Simple Fetch'
    }
  } catch (error) {
    return {
      success: false,
      error: `Simple fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Simple Fetch'
    }
  }
}

// Function to parse Anna's Archive HTML and extract book information
function parseAnnaArchiveHtml(html: string, baseUrl: string, query: string) {
  const books: any[] = []
  
  try {
    console.log('Starting HTML parsing...')
    console.log('HTML length:', html.length)
    
    // Anna's Archive has a specific structure. Let's look for the main content area
    // The actual structure uses Vue.js and specific CSS classes
    
    // Method 1: Look for the main content area that contains search results
    const mainContentMatch = html.match(/<main[^>]*>[\s\S]*?<\/main>/i) || 
                           html.match(/<div[^>]*class="[^"]*main[^"]*"[^>]*>[\s\S]*?<\/div>/i) ||
                           html.match(/<div[^>]*id="main"[^>]*>[\s\S]*?<\/div>/i)
    
    if (mainContentMatch) {
      console.log('Found main content area')
      const mainContent = mainContentMatch[0]
      
      // Look for book links - Anna's Archive typically uses /md5/ links for individual books
      const md5Links = mainContent.match(/<a[^>]*href="\/md5\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi)
      
      if (md5Links) {
        console.log(`Found ${md5Links.length} MD5 links (potential books)`)
        
        md5Links.forEach((link, index) => {
          const book = extractBookFromMd5Link(link, index, baseUrl)
          if (book) {
            books.push(book)
          }
        })
      }
    }
    
    // Method 2: If no books found in main content, search the entire HTML
    if (books.length === 0) {
      console.log('No books found in main content, searching entire HTML...')
      
      // Look for all MD5 links in the entire document
      const allMd5Links = html.match(/<a[^>]*href="\/md5\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi)
      
      if (allMd5Links) {
        console.log(`Found ${allMd5Links.length} MD5 links in entire HTML`)
        
        allMd5Links.forEach((link, index) => {
          const book = extractBookFromMd5Link(link, index, baseUrl)
          if (book) {
            books.push(book)
          }
        })
      }
    }
    
    console.log(`Total books extracted: ${books.length}`)
    
    // If no real books found, return empty array (no fake data)
    if (books.length === 0) {
      console.log('No real books found in HTML, returning empty array')
      return []
    }
    
  } catch (error) {
    console.error('Error parsing HTML:', error)
    return []
  }
  
  return books
}

// Helper function to extract book from MD5 link (Anna's Archive specific)
function extractBookFromMd5Link(link: string, index: number, baseUrl: string) {
  try {
    // Extract the URL
    const urlMatch = link.match(/href="(\/md5\/[^"]*)"/)
    if (!urlMatch) return null
    
    const url = 'https://annas-archive.org' + urlMatch[1]
    
    // Extract cover image - look for img tags within the link
    let coverUrl = ''
    const imgMatches = link.match(/<img[^>]*src="([^"]*)"[^>]*>/gi)
    if (imgMatches) {
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src="([^"]*)"/)
        if (srcMatch) {
          let src = srcMatch[1]
          // Convert relative URLs to absolute
          if (src.startsWith('//')) {
            src = 'https:' + src
          } else if (src.startsWith('/')) {
            src = 'https://annas-archive.org' + src
          }
          // Check if this looks like a cover image (not an icon or small image)
          if (src.includes('cover') || src.includes('img') || src.includes('jpg') || src.includes('png') || src.includes('webp')) {
            coverUrl = src
            break
          }
        }
      }
    }
    
    // New approach: Parse structured HTML directly
    let title = ''
    let subtitle = ''
    let author = 'Unknown Author'
    
    // Extract title from h3 tag with specific classes
    const titleMatch = link.match(/<h3[^>]*class="[^"]*font-bold[^"]*"[^>]*>([^<]+)<\/h3>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
    
    // Extract subtitle from div with specific classes (usually contains publisher info)
    const subtitleMatch = link.match(/<div[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/div>/i)
    if (subtitleMatch) {
      subtitle = subtitleMatch[1].trim()
    }
    
    // Extract author from div with italic class
    const authorMatch = link.match(/<div[^>]*class="[^"]*italic[^"]*"[^>]*>([^<]+)<\/div>/i)
    if (authorMatch) {
      author = authorMatch[1].trim()
    }
    
    // Fallback: Extract text content if structured parsing failed
    if (!title) {
      const textContent = link.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      
      // Look for title patterns in the text content
      // First, try to extract from file path pattern like "lgli/R:\ebooks\978-0-14-103940-4\Allen Carr's Easy Way to Stop Smoking Be a Happy Non-smoker for the Rest of Your Life by Allen Carr.pdf"
      const filePathMatch = textContent.match(/\\([^\\]+\.pdf|\.epub|\.mobi)/i)
      if (filePathMatch) {
        const filePath = filePathMatch[1]
        // Remove file extension and "by Author" part
        const cleanPath = filePath.replace(/\.(pdf|epub|mobi|djvu|azw3|txt|doc|docx)$/i, '')
        const byAuthorMatch = cleanPath.match(/^(.+)\s+by\s+([^\\]+)$/)
        if (byAuthorMatch) {
          title = byAuthorMatch[1].trim()
          // The author will be extracted separately later
        } else {
          title = cleanPath.trim()
        }
      }
      
      // Pattern 2: Look for structured title patterns (title followed by subtitle)
      if (!title) {
        const titlePatterns = [
          // Pattern: "Main Title: Subtitle" or "Main Title - Subtitle"
          /([A-Z][^:]{10,})[:\-]\s*([A-Z][^.]*)/,
          // Pattern: Two-line title structure
          /([A-Z][a-zA-Z\s]{10,50})\s*\n\s*([A-Z][a-zA-Z\s]{10,50})/,
          // Pattern: Title followed by descriptive subtitle
          /([A-Z][a-zA-Z\s]{15,50})\s+(A|The|An|Guide|Handbook|Manual|Introduction|Complete|Essential|Practical|Advanced|Mastering)[a-zA-Z\s]{10,50}/,
        ]
        
        for (const pattern of titlePatterns) {
          const match = textContent.match(pattern)
          if (match) {
            title = match[1].trim()
            subtitle = match[2].trim()
            break
          }
        }
      }
      
      // Pattern 3: Fallback to general text patterns
      if (!title) {
        const generalPatterns = [
          /([A-Z][a-zA-Z\s]{15,100})/,  // Capitalized text of reasonable length
          /([a-zA-Z\s]{20,100})/,       // Any text of reasonable length
        ]
        
        for (const pattern of generalPatterns) {
          const match = textContent.match(pattern)
          if (match && match[1].length > 15) {
            title = match[1].trim()
            break
          }
        }
      }
      
      // Clean up title: remove common prefixes/suffixes that aren't part of the title
      if (title) {
        title = title.replace(/^(Book|Novel|Story|Tale|Guide|Manual|Handbook)\s+/i, '')
        title = title.replace(/\s+(Book|Novel|Story|Tale|Guide|Manual|Handbook)$/i, '')
        title = title.replace(/\s*\([^)]*\)/g, '') // Remove parenthetical content
        title = title.replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed content
        title = title.trim()
      }
      
      // If no title found in text, look for title in HTML tags
      if (!title) {
        const titleTagMatches = link.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || 
                             link.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/gi) ||
                             link.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/gi)
        
        if (titleTagMatches) {
          title = titleTagMatches[0].replace(/<[^>]*>/g, '').trim()
        }
      }
      
      // Look for author information if not already found
      if (author === 'Unknown Author') {
        // First, try to extract author from file path if we found one
        if (filePathMatch) {
          const filePath = filePathMatch[1]
          const cleanPath = filePath.replace(/\.(pdf|epub|mobi|djvu|azw3|txt|doc|docx)$/i, '')
          const byAuthorMatch = cleanPath.match(/^(.+)\s+by\s+([^\\]+)$/)
          if (byAuthorMatch) {
            author = byAuthorMatch[2].trim()
          }
        }
        
        // If no author found in file path, try other patterns
        if (author === 'Unknown Author') {
          const authorPatterns = [
            /by\s+([A-Z][a-zA-Z\s]+)/i,
            /author[:\s]+([A-Z][a-zA-Z\s]+)/i,
            /([A-Z][a-z]+\s+[A-Z][a-z]+)/,  // Simple name pattern
          ]
          
          for (const pattern of authorPatterns) {
            const match = textContent.match(pattern)
            if (match && match[1].length > 3 && match[1].length < 50) {
              author = match[1].trim()
              break
            }
          }
        }
      }
    }
    
    // If we have both title and subtitle, combine them for display but keep separate for potential use
    const displayTitle = subtitle ? `${title}: ${subtitle}` : title
    
    // Look for year
    let year = ''
    const yearMatch = link.match(/\b(19|20)\d{2}\b/) || (subtitle && subtitle.match(/\b(19|20)\d{2}\b/))
    if (yearMatch) {
      year = yearMatch[0]
    }
    
    // Look for publisher
    let publisher = ''
    if (subtitle) {
      const publisherPatterns = [
        /([a-zA-Z0-9]+\.[a-zA-Z]{2,})/,  // Domain pattern like www.iitjeebooks.com
        /([A-Z][a-zA-Z\s]+),/,  // Publisher name followed by comma
      ]
      
      for (const pattern of publisherPatterns) {
        const match = subtitle.match(pattern)
        if (match && match[1].length > 3 && match[1].length < 50) {
          publisher = match[1].trim()
          break
        }
      }
    }
    
    // Look for file size
    let size = ''
    const sizePatterns = [
      /(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i,
      /size[:\s]+(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i,
    ]
    
    for (const pattern of sizePatterns) {
      const match = link.match(pattern)
      if (match) {
        size = match[1].trim()
        break
      }
    }
    
    // Look for language information (e.g., "English [en]")
    let language = ''
    const languageMatch = link.match(/([A-Za-z]+\s*\[[a-z]{2,3}\])/)
    if (languageMatch) {
      language = languageMatch[1].trim()
    }
    
    // Look for ISBN
    let isbn = ''
    const isbnPatterns = [
      /ISBN[:\s]+([0-9\-X]+)/i,
      /([0-9]{13})/,  // ISBN-13
      /([0-9]{9}[0-9X])/,  // ISBN-10
    ]
    
    for (const pattern of isbnPatterns) {
      const match = link.match(pattern)
      if (match) {
        isbn = match[1].trim()
        break
      }
    }
    
    // Look for file type (e.g., ".pdf", ".epub")
    let fileType = ''
    const fileTypeMatch = link.match(/\.(pdf|epub|mobi|djvu|azw3|txt|doc|docx)/i)
    if (fileTypeMatch) {
      fileType = '.' + fileTypeMatch[1].toLowerCase()
    }
    
    // Look for server information and detect instant download servers
    const serverNames: string[] = []
    let instantDownload = false
    
    // Method 1: Look for server patterns with rocket emoji like "🚀/nexusstc/zlib" or "🚀/lgli/lgrs"
    const rocketServerMatches = link.match(/🚀\/([^,\s]+)/g)
    if (rocketServerMatches) {
      rocketServerMatches.forEach(match => {
        // Remove the 🚀/ prefix and split by /
        const serversString = match.replace('🚀/', '')
        const servers = serversString.split('/')
        
        servers.forEach(server => {
          if (server.length >= 3) {
            serverNames.push(server)
            // Check for instant download servers
            if (server === 'lgli' || server === 'lgrs') {
              instantDownload = true
            }
          }
        })
      })
    }
    
    // Method 2: Look for server patterns without rocket emoji like "lgli/zlib" or "/zlib"
    if (serverNames.length === 0) {
      const noRocketPatterns = [
        /([a-z]{3,}\/[a-z]{3,})/g,  // "lgli/zlib" pattern
        /\/([a-z]{3,})(?=[,\s])/g,   // "/zlib" pattern (followed by comma or space)
        /([a-z]{3,}\/[a-z]{3,}(?=[,\s]))/g,  // "lgli/zlib" pattern (followed by comma or space)
      ]
      
      for (const pattern of noRocketPatterns) {
        const matches = link.match(pattern)
        if (matches) {
          matches.forEach(match => {
            // Remove leading slash if present and split by /
            const cleanMatch = match.replace(/^\//, '')
            const servers = cleanMatch.split('/')
            
            servers.forEach(server => {
              if (server.length >= 3 && !serverNames.includes(server)) {
                serverNames.push(server)
                // Check for instant download servers
                if (server === 'lgli' || server === 'lgrs') {
                  instantDownload = true
                }
              }
            })
          })
          break // Stop after first successful pattern match
        }
      }
    }
    
    // Method 3: Fallback - look for any server-like patterns in text content
    if (serverNames.length === 0) {
      const textContent = link.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const fallbackPatterns = [
        /([a-z]{3,}\/[a-z]{3,})/g,  // "lgli/zlib" pattern
        /\/([a-z]{3,})/g,           // "/zlib" pattern
      ]
      
      for (const pattern of fallbackPatterns) {
        const matches = textContent.match(pattern)
        if (matches) {
          matches.forEach(match => {
            // Remove leading slash if present and split by /
            const cleanMatch = match.replace(/^\//, '')
            const servers = cleanMatch.split('/')
            
            servers.forEach(server => {
              if (server.length >= 3 && !serverNames.includes(server)) {
                serverNames.push(server)
                // Check for instant download servers
                if (server === 'lgli' || server === 'lgrs') {
                  instantDownload = true
                }
              }
            })
          })
          break // Stop after first successful pattern match
        }
      }
    }
    
    // Extract download links and server names
    const downloadLinks: Array<{server: string, url: string}> = []
    
    // Add servers we found from text content
    serverNames.forEach(serverName => {
      downloadLinks.push({
        server: serverName,
        url: url // Use the book URL as a fallback
      })
    })
    
    // Extract the MD5 hash from the URL to use as the book ID
    const md5Match = urlMatch[1].match(/\/md5\/(.+)/)
    const md5Hash = md5Match ? md5Match[1] : `book_${index}`
    
    // Only return a book if we have at least a title or the link looks promising
    if (displayTitle || url.includes('/md5/')) {
      return {
        id: md5Hash,
        title: displayTitle || `Book ${index + 1}`,
        author: author,
        publisher: publisher || undefined,
        year: year || undefined,
        isbn: isbn || undefined,
        coverUrl: coverUrl || undefined,
        size: size || undefined,
        language: language || undefined,
        fileType: fileType || undefined,
        instantDownload: instantDownload || undefined,
        downloadLinks: downloadLinks.length > 0 ? downloadLinks : undefined,
        originalUrl: url,
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book from MD5 link ${index}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Search query is required" 
        },
        { status: 400 }
      )
    }

    // Construct Anna's Archive search URL
    const searchUrl = `https://annas-archive.org/search?q=${encodeURIComponent(query)}`
    
    console.log(`Starting source extraction for: ${searchUrl}`)
    
    // Array of extraction methods to try in order (most likely to succeed first)
    const extractionMethods = [
      () => fetchWithStandardHeaders(searchUrl),
      () => fetchSimple(searchUrl),
    ]
    
    let lastError = ""
    const attemptedMethods: string[] = []
    
    // Try each method until one succeeds
    for (const method of extractionMethods) {
      try {
        console.log(`Attempting extraction method...`)
        const result = await method()
        
        attemptedMethods.push(result.method || 'Unknown')
        
        if (result.success && result.sourceCode) {
          console.log(`✅ Success with method: ${result.method}`)
          
          // Parse the HTML to extract book information
          const books = parseAnnaArchiveHtml(result.sourceCode, searchUrl, query)
          
          return NextResponse.json({
            success: true,
            books,
            method: result.method,
            attemptedMethods
          })
        } else {
          lastError = result.error || 'Unknown error'
          console.log(`❌ Failed with method: ${result.method} - ${lastError}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        lastError = errorMessage
        console.log(`❌ Method failed with exception: ${errorMessage}`)
      }
    }
    
    // If all methods failed
    console.log(`🚫 All extraction methods failed for: ${searchUrl}`)
    return NextResponse.json(
      { 
        success: false, 
        error: `All extraction methods failed. Last error: ${lastError}. Attempted methods: ${attemptedMethods.join(', ')}`,
        attemptedMethods
      },
      { status: 500 }
    )
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during search" 
      },
      { status: 500 }
    )
  }
}