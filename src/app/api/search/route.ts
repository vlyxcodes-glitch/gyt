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

// Method 2: Enhanced mobile user agent with realistic headers
async function fetchWithMobileHeaders(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'DNT': '1',
        'Referer': 'https://www.google.com/',
      },
      signal: AbortSignal.timeout(18000),
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
      method: 'Enhanced Mobile Safari'
    }
  } catch (error) {
    return {
      success: false,
      error: `Enhanced mobile fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Enhanced Mobile Safari'
    }
  }
}

// Method 3: Fetch with search engine bot headers
async function fetchWithBotHeaders(url: string): Promise<ExtractionResult> {
  try {
    // Try multiple search engine bots
    const botUserAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
    ]
    
    const userAgent = botUserAgents[Math.floor(Math.random() * botUserAgents.length)]
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      signal: AbortSignal.timeout(15000),
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
      method: 'Search Engine Bot'
    }
  } catch (error) {
    return {
      success: false,
      error: `Search engine bot fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Search Engine Bot'
    }
  }
}

// Method 4: Simple fetch without special headers
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

// Method 5: Fetch with social media crawler headers (often whitelisted)
async function fetchWithSocialCrawler(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'max-age=0',
      },
      signal: AbortSignal.timeout(15000),
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
      method: 'Social Crawler'
    }
  } catch (error) {
    return {
      success: false,
      error: `Social crawler failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Social Crawler'
    }
  }
}

// Method 6: Fetch with Twitter crawler headers
async function fetchWithTwitterBot(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Twitterbot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(15000),
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
      method: 'Twitter Bot'
    }
  } catch (error) {
    return {
      success: false,
      error: `Twitter bot failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Twitter Bot'
    }
  }
}

// Method 7: Fetch with delay and Firefox headers
async function fetchWithDelayedFirefox(url: string): Promise<ExtractionResult> {
  try {
    // Add a small delay to avoid rapid requests
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'TE': 'trailers',
      },
      signal: AbortSignal.timeout(18000),
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
      method: 'Delayed Firefox'
    }
  } catch (error) {
    return {
      success: false,
      error: `Delayed Firefox failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Delayed Firefox'
    }
  }
}

// Method 8: Advanced browser simulation with session-like headers
async function fetchWithAdvancedBrowser(url: string): Promise<ExtractionResult> {
  try {
    // Add delay to simulate human behavior
    await new Promise(resolve => setTimeout(resolve, 1500))
    
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
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'DNT': '1',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/search?q=' + encodeURIComponent(url),
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(25000),
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
      method: 'Advanced Browser Simulation'
    }
  } catch (error) {
    return {
      success: false,
      error: `Advanced browser simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Advanced Browser Simulation'
    }
  }
}

// Method 9: Try accessing through different path variations
async function fetchWithPathVariations(url: string): Promise<ExtractionResult> {
  try {
    // Try the original URL with different query parameters or modifications
    const variations = [
      url,
      url + (url.includes('?') ? '&' : '?') + 'ref=direct',
      url + (url.includes('?') ? '&' : '?') + 'utm_source=google',
      url.replace(/\/$/, '') + '/', // Add or remove trailing slash
    ]
    for (const variantUrl of variations) {
      try {
        const response = await fetch(variantUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: AbortSignal.timeout(15000),
        })
        if (response.ok) {
          const html = await response.text()
          const cleanedHtml = cleanHtml(html)
          
          return {
            success: true,
            sourceCode: cleanedHtml,
            size: Buffer.byteLength(cleanedHtml, 'utf8').toString(),
            title: extractTitle(html),
            method: `Path Variation (${variantUrl !== url ? 'modified' : 'original'})`
          }
        }
      } catch (error) {
        // Continue to next variation
        console.log(`Path variation ${variantUrl} failed:`, error)
      }
    }
    throw new Error('All path variations failed')
  } catch (error) {
    return {
      success: false,
      error: `Path variations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Path Variations'
    }
  }
}

// Method 10: Fetch with minimal curl headers
async function fetchWithCurlHeaders(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'curl/7.68.0',
        'Accept': '*/*',
      },
      signal: AbortSignal.timeout(10000),
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
      method: 'Curl Headers'
    }
  } catch (error) {
    return {
      success: false,
      error: `Curl fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: 'Curl Headers'
    }
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
      () => fetchWithSocialCrawler(searchUrl),
      () => fetchWithTwitterBot(searchUrl),
      () => fetchWithMobileHeaders(searchUrl),
      () => fetchWithBotHeaders(searchUrl),
      () => fetchWithDelayedFirefox(searchUrl),
      () => fetchWithAdvancedBrowser(searchUrl),
      () => fetchWithPathVariations(searchUrl),
      () => fetchSimple(searchUrl),
      () => fetchWithCurlHeaders(searchUrl),
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
    
    // Method 3: Look for table-based results (fallback)
    if (books.length === 0) {
      console.log('No books found with MD5 links, checking for table-based results...')
      
      const tableRows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)
      if (tableRows) {
        console.log(`Found ${tableRows.length} table rows`)
        
        tableRows.forEach((row, index) => {
          // Check if this row contains book information
          if (row.includes('md5') || row.includes('title') || row.includes('author')) {
            const book = extractBookFromTableRow(row, index, baseUrl)
            if (book) {
              books.push(book)
            }
          }
        })
      }
    }
    
    // Method 4: Look for any links that might be book-related
    if (books.length === 0) {
      console.log('No books found with previous methods, looking for any book-related links...')
      
      // Look for links that contain book-related keywords
      const allLinks = html.match(/<a[^>]*href="[^"]*"[^>]*>[\s\S]*?<\/a>/gi)
      
      if (allLinks) {
        console.log(`Found ${allLinks.length} total links, filtering for book-related ones...`)
        
        allLinks.forEach((link, index) => {
          if (link.match(/title|author|book|md5|search/i) && link.length > 50 && link.length < 2000) {
            const book = extractBookFromGenericLink(link, index, baseUrl)
            if (book) {
              books.push(book)
            }
          }
        })
      }
    }
    
    // Method 5: Look for book information in script tags or JSON data
    if (books.length === 0) {
      console.log('No books found with links, checking for embedded data...')
      
      // Look for JSON data in script tags
      const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi)
      if (scriptTags) {
        scriptTags.forEach((script, scriptIndex) => {
          try {
            // Look for book data in the script content
            const scriptContent = script.replace(/<script[^>]*>|<\/script>/gi, '').trim()
            
            // Try to parse as JSON
            if (scriptContent.startsWith('{') || scriptContent.startsWith('[')) {
              try {
                const jsonData = JSON.parse(scriptContent)
                const book = extractBookFromJsonData(jsonData, `script_${scriptIndex}`, baseUrl)
                if (book) {
                  books.push(book)
                }
              } catch (e) {
                // Not valid JSON, continue
              }
            }
            
            // Look for book URLs in the script content
            const md5Matches = scriptContent.match(/\/md5\/[^"'\s]*/g)
            if (md5Matches) {
              md5Matches.forEach((md5Match, md5Index) => {
                const book = {
                  id: `script_${scriptIndex}_${md5Index}`,
                  title: `Book from script ${scriptIndex}`,
                  author: 'Unknown Author',
                  originalUrl: 'https://annas-archive.org' + md5Match,
                }
                books.push(book)
              })
            }
          } catch (e) {
            console.log(`Error processing script ${scriptIndex}:`, e)
          }
        })
      }
    }
    
    console.log(`Total books extracted: ${books.length}`)
    
    // If no real books found, return empty array (no fake data)
    if (books.length === 0) {
      console.log('No real books found in HTML, returning empty array')
      
      // For debugging, let's log some HTML structure info
      const debugInfo = {
        htmlLength: html.length,
        containsMd5: html.includes('/md5/'),
        containsBook: html.toLowerCase().includes('book'),
        containsTitle: html.toLowerCase().includes('title'),
        containsAuthor: html.toLowerCase().includes('author'),
        linkCount: (html.match(/<a[^>]*href=/gi) || []).length,
        tableCount: (html.match(/<table/gi) || []).length,
        divCount: (html.match(/<div/gi) || []).length,
      }
      
      console.log('Debug info:', debugInfo)
      
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
    
    // Extract text content from the link
    const textContent = link.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    // Extract detailed information from the text content based on Anna's Archive format
    // Example: "English [en], .pdf, 🚀/lgli/lgrs/nexusstc/zlib, 14.2MB, 📘 Book (non-fiction)"
    
    // Look for language information (e.g., "English [en]")
    let language = ''
    const languageMatch = textContent.match(/([A-Za-z]+\s*\[[a-z]{2,3}\])/)
    if (languageMatch) {
      language = languageMatch[1].trim()
    } else {
      // Fallback: look for language names without brackets
      const languagePatterns = [
        /English/i,
        /Spanish/i,
        /French/i,
        /German/i,
        /Chinese/i,
        /Japanese/i,
        /Russian/i,
        /Arabic/i,
        /Hindi/i,
        /Portuguese/i,
        /Italian/i,
        /Dutch/i,
        /Korean/i,
      ]
      for (const pattern of languagePatterns) {
        if (pattern.test(textContent)) {
          language = pattern.source.replace(/[\/\\]/g, '').replace(/i/g, '')
          break
        }
      }
    }
    
    // Look for file type (e.g., ".pdf", ".epub")
    let fileType = ''
    const fileTypeMatch = textContent.match(/\.(pdf|epub|mobi|djvu|azw3|txt|doc|docx)/i)
    if (fileTypeMatch) {
      fileType = '.' + fileTypeMatch[1].toLowerCase()
    }
    
    // Look for server information and detect instant download servers
    const serverNames: string[] = []
    let instantDownload = false
    
    // Look for server patterns like "🚀/lgli/lgrs/nexusstc/zlib"
    const serverPatternMatch = textContent.match(/\/([a-z]{3,}(?:\/[a-z]{3,})*)/i)
    if (serverPatternMatch) {
      const servers = serverPatternMatch[1].split('/')
      servers.forEach(server => {
        if (server.length >= 3) {
          serverNames.push(server)
          // Check for instant download servers
          if (server === 'lgli' || server === 'lgrs') {
            instantDownload = true
          }
        }
      })
    }
    
    // Also look for individual server mentions
    const individualServerPattern = /(lgli|lgrs|nexusstc|zlib|libgen|gen|rus|eng)/gi
    let individualServerMatch
    while ((individualServerMatch = individualServerPattern.exec(textContent)) !== null) {
      const server = individualServerMatch[1].toLowerCase()
      if (!serverNames.includes(server)) {
        serverNames.push(server)
        if (server === 'lgli' || server === 'lgrs') {
          instantDownload = true
        }
      }
    }
    
    // Look for title patterns in the text content
    // First, try to extract from file path pattern like "lgli/R:\ebooks\978-0-14-103940-4\Allen Carr's Easy Way to Stop Smoking Be a Happy Non-smoker for the Rest of Your Life by Allen Carr.pdf"
    let title = ''
    let subtitle = ''
    
    // Pattern 1: Extract from file path with backslashes
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
    
    // If we have both title and subtitle, combine them for display but keep separate for potential use
    const displayTitle = subtitle ? `${title}: ${subtitle}` : title
    
    // If no title found in text, look for title in HTML tags
    if (!title) {
      const titleTagMatches = link.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) ||
                           link.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/gi) ||
                           link.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/gi)
      
      if (titleTagMatches) {
        title = titleTagMatches[0].replace(/<[^>]*>/g, '').trim()
      }
    }
    
    // Look for author information
    let author = 'Unknown Author'
    
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
    
    // Look for year
    let year = ''
    const yearMatch = textContent.match(/\b(19|20)\d{2}\b/)
    if (yearMatch) {
      year = yearMatch[0]
    }
    
    // Look for publisher
    let publisher = ''
    const publisherPatterns = [
      /publisher[:\s]+([A-Z][a-zA-Z\s]+)/i,
      /published by\s+([A-Z][a-zA-Z\s]+)/i,
    ]
    
    for (const pattern of publisherPatterns) {
      const match = textContent.match(pattern)
      if (match && match[1].length > 3 && match[1].length < 100) {
        publisher = match[1].trim()
        break
      }
    }
    
    // Look for file size
    let size = ''
    const sizePatterns = [
      /(\d+(?:\.\d+)?\s*(?:MB|GB|KB|bytes))/i,
      /size[:\s]+(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i,
    ]
    
    for (const pattern of sizePatterns) {
      const match = textContent.match(pattern)
      if (match) {
        size = match[1].trim()
        break
      }
    }
    
    // Look for ISBN
    let isbn = ''
    const isbnPatterns = [
      /ISBN[:\s]+([0-9\-X]+)/i,
      /([0-9]{13})/,  // ISBN-13
      /([0-9]{9}[0-9X])/,  // ISBN-10
    ]
    
    for (const pattern of isbnPatterns) {
      const match = textContent.match(pattern)
      if (match) {
        isbn = match[1].trim()
        break
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
    
    // Look for download links within the book item
    const downloadLinkMatches = link.match(/<a[^>]*href="[^"]*"[^>]*>([^<]*(?:download|mirror|server|z-lib|libgen)[^<]*)<\/a>/gi)
    if (downloadLinkMatches) {
      downloadLinkMatches.forEach((downloadLink) => {
        const hrefMatch = downloadLink.match(/href="([^"]*)"/)
        const textMatch = downloadLink.match(/>([^<]+)</)
        
        if (hrefMatch && textMatch) {
          let downloadUrl = hrefMatch[1]
          let serverName = textMatch[1].trim()
          
          // Convert relative URLs to absolute
          if (downloadUrl.startsWith('/')) {
            downloadUrl = 'https://annas-archive.org' + downloadUrl
          }
          
          // Clean up server name
          serverName = serverName.replace(/download|mirror|server/gi, '').trim()
          if (!serverName) {
            serverName = 'Unknown Server'
          }
          
          // Check for instant download servers
          if (serverName.toLowerCase() === 'lgli' || serverName.toLowerCase() === 'lgrs') {
            instantDownload = true
          }
          
          downloadLinks.push({
            server: serverName,
            url: downloadUrl
          })
        }
      })
    }
    
    // If no download links found in the link itself, create some generic ones
    if (downloadLinks.length === 0) {
      // Look for any external links that might be download servers
      const allLinks = link.match(/<a[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/gi)
      if (allLinks) {
        allLinks.forEach((itemLink) => {
          const hrefMatch = itemLink.match(/href="([^"]*)"/)
          const textMatch = itemLink.match(/>([^<]+)</)
          
          if (hrefMatch && textMatch) {
            const linkUrl = hrefMatch[1]
            const linkText = textMatch[1].trim()
            
            // Check if this looks like a download link
            if (linkUrl.includes('http') && (linkText.toLowerCase().includes('download') || 
                linkText.toLowerCase().includes('mirror') || 
                linkText.toLowerCase().includes('server') ||
                linkText.toLowerCase().includes('z-lib') ||
                linkText.toLowerCase().includes('libgen'))) {
              
              let serverName = linkText
                .replace(/download|mirror|server/gi, '')
                .trim()
              
              if (!serverName) {
                // Try to extract server name from URL
                const urlMatch = linkUrl.match(/https?:\/\/([^\/]+)/)
                if (urlMatch) {
                  serverName = urlMatch[1].split('.')[0]
                } else {
                  serverName = 'Unknown Server'
                }
              }
              
              // Check for instant download servers
              if (serverName.toLowerCase() === 'lgli' || serverName.toLowerCase() === 'lgrs') {
                instantDownload = true
              }
              
              downloadLinks.push({
                server: serverName,
                url: linkUrl
              })
            }
          }
        })
      }
    }
    
    // Only return a book if we have at least a title or the link looks promising
    if (displayTitle || url.includes('/md5/')) {
      return {
        id: `book_${index}`,
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

// Helper function to extract book from JSON data
function extractBookFromJsonData(data: any, index: string, baseUrl: string) {
  try {
    // Handle different JSON structures
    if (typeof data === 'object' && data !== null) {
      // Look for common book properties
      const title = data.title || data.name || data.book_title || data.document_title
      const author = data.author || data.creator || data.by || data.book_author
      const year = data.year || data.date?.split('-')?.[0] || data.published_date
      const publisher = data.publisher || data.published_by || data.publication
      const isbn = data.isbn || data.identifier || data.id
      const size = data.size || data.file_size || data.length
      
      // Look for URL
      let url = data.url || data.link || data.href
      if (!url && data.md5) {
        url = `https://annas-archive.org/md5/${data.md5}`
      }
      
      // Look for cover image
      let coverUrl = data.cover || data.image || data.thumbnail || data.cover_url
      if (coverUrl && coverUrl.startsWith('/')) {
        coverUrl = 'https://annas-archive.org' + coverUrl
      }
      
      // Look for download links
      const downloadLinks: Array<{server: string, url: string}> = []
      if (data.download_links || data.mirrors || data.servers) {
        const links = data.download_links || data.mirrors || data.servers
        if (Array.isArray(links)) {
          links.forEach((link, linkIndex) => {
            if (typeof link === 'string') {
              downloadLinks.push({
                server: `Server ${linkIndex + 1}`,
                url: link.startsWith('http') ? link : `https://annas-archive.org${link}`
              })
            } else if (typeof link === 'object' && link.url) {
              downloadLinks.push({
                server: link.server || link.name || `Server ${linkIndex + 1}`,
                url: link.url
              })
            }
          })
        }
      }
      
      // Only return if we have at least a title
      if (title) {
        return {
          id: `json_${index}`,
          title: typeof title === 'string' ? title : String(title),
          author: typeof author === 'string' ? author : (Array.isArray(author) ? author[0] : 'Unknown Author'),
          publisher: typeof publisher === 'string' ? publisher : undefined,
          year: typeof year === 'string' ? year : (typeof year === 'number' ? String(year) : undefined),
          isbn: typeof isbn === 'string' ? isbn : undefined,
          coverUrl: typeof coverUrl === 'string' ? coverUrl : undefined,
          size: typeof size === 'string' ? size : (typeof size === 'number' ? `${size} bytes` : undefined),
          downloadLinks: downloadLinks.length > 0 ? downloadLinks : undefined,
          originalUrl: typeof url === 'string' ? url : `${baseUrl}&json=${index}`,
        }
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book from JSON data ${index}:`, error)
    return null
  }
}

// Helper function to extract book from generic link
function extractBookFromGenericLink(link: string, index: number, baseUrl: string) {
  try {
    // Extract URL
    const urlMatch = link.match(/href="([^"]*)"/)
    if (!urlMatch) return null
    
    let url = urlMatch[1]
    if (url.startsWith('/')) {
      url = 'https://annas-archive.org' + url
    }
    
    // Extract text content
    const textContent = link.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    // Only process if the text content looks like it could be a book title
    if (textContent.length < 5 || textContent.length > 200) {
      return null
    }
    
    // Extract title (use the text content if it looks reasonable)
    let title = textContent
    if (title.length > 100) {
      title = title.substring(0, 100) + '...'
    }
    
    return {
      id: `book_${index}`,
      title: title,
      author: 'Unknown Author',
      originalUrl: url,
    }
  } catch (error) {
    console.error(`Error extracting book from generic link ${index}:`, error)
    return null
  }
}

// Helper function to extract book information from HTML item
function extractBookFromHtml(html: string, index: number, baseUrl: string) {
  try {
    // Extract title
    let title = ''
    const titlePatterns = [
      /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i,
      /<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/i,
      /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/i,
      /title[^>]*>\s*([^<\n]+)/i,
    ]
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern)
      if (match) {
        title = match[1].trim()
        break
      }
    }
    
    // Extract author
    let author = ''
    const authorPatterns = [
      /author[^>]*>\s*([^<\n]+)/i,
      /<div[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/div>/i,
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i,
      /by\s*([^<\n]+)/i,
    ]
    
    for (const pattern of authorPatterns) {
      const match = html.match(pattern)
      if (match) {
        author = match[1].trim()
        break
      }
    }
    
    // Extract publisher
    let publisher = ''
    const publisherPatterns = [
      /publisher[^>]*>\s*([^<\n]+)/i,
      /<div[^>]*class="[^"]*publisher[^"]*"[^>]*>([^<]+)<\/div>/i,
      /published by\s*([^<\n]+)/i,
    ]
    
    for (const pattern of publisherPatterns) {
      const match = html.match(pattern)
      if (match) {
        publisher = match[1].trim()
        break
      }
    }
    
    // Extract year
    let year = ''
    const yearPatterns = [
      /year[^>]*>\s*(\d{4})/i,
      /(\d{4})/g,
    ]
    
    for (const pattern of yearPatterns) {
      const matches = html.match(pattern)
      if (matches) {
        // Take the first 4-digit number that looks like a year
        const years = matches.filter(m => parseInt(m) >= 1800 && parseInt(m) <= new Date().getFullYear())
        if (years.length > 0) {
          year = years[0]
          break
        }
      }
    }
    
    // Extract ISBN
    let isbn = ''
    const isbnPatterns = [
      /isbn[^>]*>\s*([^<\n]+)/i,
      /ISBN\s*([0-9\-X]+)/i,
    ]
    
    for (const pattern of isbnPatterns) {
      const match = html.match(pattern)
      if (match) {
        isbn = match[1].trim()
        break
      }
    }
    
    // Extract cover image
    let coverUrl = ''
    const coverPatterns = [
      /<img[^>]*src="([^"]*)"[^>]*>/i,
      /cover[^>]*src="([^"]*)"/i,
    ]
    
    for (const pattern of coverPatterns) {
      const match = html.match(pattern)
      if (match) {
        coverUrl = match[1]
        if (coverUrl.startsWith('//')) {
          coverUrl = 'https:' + coverUrl
        } else if (coverUrl.startsWith('/')) {
          coverUrl = 'https://annas-archive.org' + coverUrl
        }
        break
      }
    }
    
    // Extract file size
    let size = ''
    const sizePatterns = [
      /size[^>]*>\s*([^<\n]+)/i,
      /(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i,
    ]
    
    for (const pattern of sizePatterns) {
      const match = html.match(pattern)
      if (match) {
        size = match[1].trim()
        break
      }
    }
    
    // Extract URL
    let originalUrl = ''
    const urlPatterns = [
      /href="\/(md5|search)\/([^"]*)"/i,
      /<a[^>]*href="([^"]*)"[^>]*>/i,
    ]
    
    for (const pattern of urlPatterns) {
      const match = html.match(pattern)
      if (match) {
        originalUrl = match[1]
        if (originalUrl.startsWith('/')) {
          originalUrl = 'https://annas-archive.org' + originalUrl
        }
        break
      }
    }
    
    // Only return a book if we have at least a title
    if (title) {
      return {
        id: `book_${index}`,
        title,
        author: author || 'Unknown Author',
        publisher: publisher || undefined,
        year: year || undefined,
        isbn: isbn || undefined,
        coverUrl: coverUrl || undefined,
        size: size || undefined,
        originalUrl: originalUrl || `${baseUrl}&index=${index}`,
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book ${index}:`, error)
    return null
  }
}

// Helper function to extract book from table row
function extractBookFromTableRow(row: string, index: number, baseUrl: string) {
  try {
    // Extract cover image from table row
    let coverUrl = ''
    const imgMatches = row.match(/<img[^>]*src="([^"]*)"[^>]*>/gi)
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
          // Check if this looks like a cover image
          if (src.includes('cover') || src.includes('img') || src.includes('jpg') || src.includes('png') || src.includes('webp')) {
            coverUrl = src
            break
          }
        }
      }
    }
    
    // Remove HTML tags and get text content
    const textContent = row.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    // Look for patterns in the text
    const titleMatch = textContent.match(/([A-Z][^0-9]+)/i) || textContent.match(/([a-zA-Z][^0-9]{10,})/i)
    const authorMatch = textContent.match(/by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
    const yearMatch = textContent.match(/\b(19|20)\d{2}\b/)
    
    // Look for file size
    let size = ''
    const sizeMatch = textContent.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|KB))/i)
    if (sizeMatch) {
      size = sizeMatch[1].trim()
    }
    
    // Look for publisher
    let publisher = ''
    const publisherMatch = textContent.match(/publisher[:\s]+([A-Z][a-zA-Z\s]+)/i)
    if (publisherMatch) {
      publisher = publisherMatch[1].trim()
    }
    
    // Extract download links from table row
    const downloadLinks: Array<{server: string, url: string}> = []
    const downloadMatches = row.match(/<a[^>]*href="[^"]*"[^>]*>([^<]*(?:download|mirror|server|z-lib|libgen)[^<]*)<\/a>/gi)
    
    if (downloadMatches) {
      downloadMatches.forEach((downloadLink) => {
        const hrefMatch = downloadLink.match(/href="([^"]*)"/)
        const textMatch = downloadLink.match(/>([^<]+)</)
        
        if (hrefMatch && textMatch) {
          let downloadUrl = hrefMatch[1]
          let serverName = textMatch[1].trim()
          
          // Convert relative URLs to absolute
          if (downloadUrl.startsWith('/')) {
            downloadUrl = 'https://annas-archive.org' + downloadUrl
          }
          
          // Clean up server name
          serverName = serverName.replace(/download|mirror|server/gi, '').trim()
          if (!serverName) {
            serverName = 'Unknown Server'
          }
          
          downloadLinks.push({
            server: serverName,
            url: downloadUrl
          })
        }
      })
    }
    
    if (titleMatch) {
      return {
        id: `book_${index}`,
        title: titleMatch[1].trim(),
        author: authorMatch ? authorMatch[1].trim() : 'Unknown Author',
        year: yearMatch ? yearMatch[0] : undefined,
        publisher: publisher || undefined,
        size: size || undefined,
        coverUrl: coverUrl || undefined,
        downloadLinks: downloadLinks.length > 0 ? downloadLinks : undefined,
        originalUrl: `${baseUrl}&index=${index}`,
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book from table row ${index}:`, error)
    return null
  }
}

// Helper function to extract book from link
function extractBookFromLink(link: string, index: number, baseUrl: string) {
  try {
    const urlMatch = link.match(/href="([^"]*)"/)
    const titleMatch = link.match(/>([^<]+)</)
    
    if (urlMatch && titleMatch) {
      const url = urlMatch[1]
      const title = titleMatch[1].trim()
      
      if (title && title.length > 5) { // Reasonable title length
        return {
          id: `book_${index}`,
          title,
          author: 'Unknown Author',
          originalUrl: url.startsWith('http') ? url : `https://annas-archive.org${url}`,
        }
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book from link ${index}:`, error)
    return null
  }
}

// Helper function to extract book from JSON-LD
function extractBookFromJsonLd(data: any, index: string, baseUrl: string) {
  try {
    if (data['@type'] === 'Book' || data.name) {
      return {
        id: `book_${index}`,
        title: data.name || data.title || 'Unknown Title',
        author: data.author || (Array.isArray(data.author) ? data.author[0] : 'Unknown Author'),
        publisher: data.publisher || (typeof data.publisher === 'object' ? data.publisher.name : undefined),
        year: data.datePublished ? new Date(data.datePublished).getFullYear().toString() : undefined,
        isbn: data.isbn || data.identifier,
        coverUrl: data.image || data.thumbnailUrl,
        originalUrl: data.url || `${baseUrl}&index=${index}`,
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error extracting book from JSON-LD ${index}:`, error)
    return null
  }
}