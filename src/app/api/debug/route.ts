import { type NextRequest, NextResponse } from "next/server"

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
    
    console.log(`Debug: Fetching HTML from: ${searchUrl}`)
    
    try {
      const response = await fetch(searchUrl, {
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
        signal: AbortSignal.timeout(20000),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const html = await response.text()
      
      // Analyze the HTML structure
      const analysis = {
        url: searchUrl,
        htmlLength: html.length,
        title: extractTitle(html),
        containsBookItems: html.includes('book') || html.includes('md5') || html.includes('search-result'),
        containsTable: html.includes('<table'),
        containsLinks: html.includes('<a href='),
        containsJsonData: html.includes('application/ld+json') || html.includes('__INITIAL_STATE__'),
        
        // Look for common patterns
        patterns: {
          bookItems: (html.match(/<div[^>]*class="[^"]*book[^"]*"[^>]*>/gi) || []).length,
          searchResults: (html.match(/<div[^>]*class="[^"]*search-result[^"]*"[^>]*>/gi) || []).length,
          md5Links: (html.match(/href="\/md5\//gi) || []).length,
          tableRows: (html.match(/<tr[^>]*>/gi) || []).length,
          jsonScripts: (html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/gi) || []).length,
        },
        
        // Sample of the HTML (first 2000 chars)
        htmlSample: html.substring(0, 2000),
        
        // Look for specific book-related content
        bookContent: extractBookContentSample(html)
      }
      
      return NextResponse.json({
        success: true,
        analysis
      })
      
    } catch (error) {
      console.error('Debug fetch error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during debug" 
      },
      { status: 500 }
    )
  }
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : "Unknown Title"
}

function extractBookContentSample(html: string): string[] {
  const samples: string[] = []
  
  // Look for potential book content
  const patterns = [
    /<div[^>]*class="[^"]*book[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<a[^>]*href="\/md5\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
    /<tr[^>]*>[\s\S]*?<\/tr>/gi,
  ]
  
  for (const pattern of patterns) {
    const matches = html.match(pattern)
    if (matches) {
      samples.push(...matches.slice(0, 3)) // Take first 3 matches
    }
  }
  
  return samples.map(sample => sample.substring(0, 500)) // Limit sample size
}