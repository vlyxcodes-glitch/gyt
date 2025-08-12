import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for ZAI SDK to handle deployment environments
async function getZAI() {
  try {
    const ZAI = await import('z-ai-web-dev-sdk');
    return ZAI.default;
  } catch (error) {
    console.warn('ZAI SDK not available, using fallback fetch:', error);
    return null;
  }
}

interface BookData {
  title: string;
  author: string;
  publisher: string;
  year: string;
  description: string;
  coverImage: string;
  md5: string;
  slowDownloadLinks: Array<{
    url: string;
    text: string;
    note?: string;
  }>;
  libgenLink?: string;
}

function extractTextBetween(html: string, start: string, end: string): string {
  const startIndex = html.indexOf(start);
  if (startIndex === -1) return '';
  const endIndex = html.indexOf(end, startIndex + start.length);
  if (endIndex === -1) return '';
  return html.substring(startIndex + start.length, endIndex);
}

function extractTextAfter(html: string, start: string, until?: string): string {
  const startIndex = html.indexOf(start);
  if (startIndex === -1) return '';
  const contentStart = startIndex + start.length;
  if (!until) return html.substring(contentStart);
  
  const endIndex = html.indexOf(until, contentStart);
  if (endIndex === -1) return html.substring(contentStart);
  return html.substring(contentStart, endIndex);
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCoverImage(html: string, md5: string): string {
  // Look for cover image with specific ID pattern
  const coverIdPattern = new RegExp(`<div id="cover_aarecord_id__md5:${md5}"[^>]*>.*?<img[^>]+src="([^"]+)"`, 'i');
  const coverMatch = html.match(coverIdPattern);
  if (coverMatch && coverMatch[1]) {
    return coverMatch[1].startsWith('http') ? coverMatch[1] : `https://annas-archive.org${coverMatch[1]}`;
  }
  
  // Fallback: look for any img tag within the cover div
  const coverDivPattern = new RegExp(`<div id="cover_aarecord_id__md5:${md5}"[^>]*>([\\s\\S]*?)</div>`, 'i');
  const coverDivMatch = html.match(coverDivPattern);
  if (coverDivMatch) {
    const imgPattern = /<img[^>]+src="([^"]+)"/i;
    const imgMatch = coverDivMatch[1].match(imgPattern);
    if (imgMatch) {
      return imgMatch[1].startsWith('http') ? imgMatch[1] : `https://annas-archive.org${imgMatch[1]}`;
    }
  }
  
  return '';
}

function extractBookDetails(html: string): {
  title: string;
  author: string;
  publisher: string;
  year: string;
  description: string;
} {
  // Extract title from text-3xl font-bold div
  let title = '';
  const titlePattern = /<div[^>]+class="[^"]*text-3xl[^"]*font-bold[^"]*"[^>]*>([^<]+)<\/div>/i;
  const titleMatch = html.match(titlePattern);
  if (titleMatch) {
    title = cleanText(titleMatch[1]);
  }

  // Extract description from js-md5-top-box-description
  let description = '';
  let author = 'Unknown Author';
  let publisher = '';
  let year = '';

  const descPattern = /<div[^>]+class="[^"]*js-md5-top-box-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
  const descMatch = html.match(descPattern);
  if (descMatch) {
    const descContent = descMatch[1];
    
    // Extract the main description (first div after "description" label)
    const mainDescPattern = /<div[^>]+class="[^"]*text-xs[^"]*text-gray-500[^"]*uppercase[^"]*"[^>]*>description<\/div>\s*<div[^>]+class="[^"]*mb-1[^"]*"[^>]*>([^<]+)/i;
    const mainDescMatch = descContent.match(mainDescPattern);
    if (mainDescMatch) {
      description = cleanText(mainDescMatch[1]);
    }

    // Extract author, publisher, year from the description content
    const descLines = descContent.split(/<div[^>]*>/i);
    descLines.forEach(line => {
      const cleanLine = cleanText(line.replace(/<\/div>/gi, ''));
      
      // Look for author pattern (typically after title)
      if (cleanLine.includes('.') && !author.includes('Unknown')) {
        // Try to extract author from description line
        const authorPattern = /([A-Z][a-z]+ [A-Z][a-z]+)\./;
        const authorMatch = cleanLine.match(authorPattern);
        if (authorMatch && authorMatch[1].length > 3 && authorMatch[1].length < 50) {
          author = authorMatch[1];
        }
      }
      
      // Look for publisher
      const publisherPattern = /([A-Z][a-z]+ [A-Z][a-z]+ Press|[A-Z][a-z]+ Publishing|[A-Z][a-z]+ & [A-Z][a-z]+|[A-Z][a-z]+ University)/i;
      const publisherMatch = cleanLine.match(publisherPattern);
      if (publisherMatch) {
        publisher = publisherMatch[1];
      }
      
      // Look for year
      const yearPattern = /\b(19|20)\d{2}\b/;
      const yearMatch = cleanLine.match(yearPattern);
      if (yearMatch) {
        year = yearMatch[0];
      }
    });
  }

  return { title, author, publisher, year, description };
}

function extractSlowDownloadLinks(html: string): Array<{
  url: string;
  text: string;
  note?: string;
}> {
  const slowDownloadLinks: Array<{ url: string; text: string; note?: string }> = [];

  // Find the slow downloads section
  const slowSectionPattern = /<div[^>]*>\s*<h3[^>]*>🐢 Slow downloads<\/h3>.*?<ul[^>]*class="[^"]*list-inside[^"]*"[^>]*>([\s\S]*?)<\/ul>/i;
  const slowSectionMatch = html.match(slowSectionPattern);
  
  if (slowSectionMatch) {
    const listContent = slowSectionMatch[1];
    
    // Extract each list item
    const itemPattern = /<li[^>]*class="[^"]*list-disc[^"]*"[^>]*>(.*?)<\/li>/gi;
    let itemMatch;
    
    while ((itemMatch = itemPattern.exec(listContent)) !== null) {
      const itemContent = itemMatch[1];
      
      // Extract the link
      const linkPattern = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*js-download-link[^"]*"[^>]*>([^<]+)<\/a>/i;
      const linkMatch = itemContent.match(linkPattern);
      
      if (linkMatch) {
        const url = linkMatch[1].startsWith('http') ? linkMatch[1] : `https://annas-archive.org${linkMatch[1]}`;
        const text = cleanText(linkMatch[2]);
        
        // Extract note if present (text outside the link tag)
        let note = '';
        const notePattern = /<\/a>\s*\(([^)]+)\)/i;
        const noteMatch = itemContent.match(notePattern);
        if (noteMatch) {
          note = cleanText(noteMatch[1]);
        }
        
        slowDownloadLinks.push({
          url,
          text,
          note
        });
      }
    }
  }

  return slowDownloadLinks;
}

function extractLibgenLink(html: string): string | undefined {
  // Find the external download links section
  const externalSectionPattern = /<ul[^>]+class="[^"]*list-inside[^"]*js-show-external[^"]*"[^>]*>([\s\S]*?)<\/ul>/i;
  const externalSectionMatch = html.match(externalSectionPattern);
  
  if (externalSectionMatch) {
    const listContent = externalSectionMatch[1];
    
    // Look for links containing /ads.php (Libgen instant download)
    const adsPattern = /<a[^>]+href="([^"]*\/ads\.php[^"]*)"[^>]*class="[^"]*js-download-link[^"]*"[^>]*>([^<]+)<\/a>/i;
    const adsMatch = listContent.match(adsPattern);
    
    if (adsMatch) {
      return adsMatch[1].startsWith('http') ? adsMatch[1] : `https://annas-archive.org${adsMatch[1]}`;
    }
  }

  return undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const bookId = id;
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Construct the Anna Archive URL
    const annaUrl = `https://annas-archive.org/md5/${bookId}`;
    
    // Fetch the HTML content
    let html: string;
    
    try {
      // Try to use ZAI SDK if available
      const ZAI = await getZAI();
      if (ZAI) {
        const zai = await ZAI.create();
        const response = await fetch(annaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Anna Archive page: ${response.status}`);
        }
        
        html = await response.text();
      } else {
        // Fallback to direct fetch
        const response = await fetch(annaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Anna Archive page: ${response.status}`);
        }
        
        html = await response.text();
      }
    } catch (error) {
      console.error('Error fetching Anna Archive page:', error);
      throw new Error(`Failed to fetch Anna Archive page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Extract book details
    const bookDetails = extractBookDetails(html);
    const coverImage = extractCoverImage(html, bookId);
    const slowDownloadLinks = extractSlowDownloadLinks(html);
    const libgenLink = extractLibgenLink(html);

    // Construct the response
    const bookData: BookData = {
      title: bookDetails.title || 'Unknown Title',
      author: bookDetails.author || 'Unknown Author',
      publisher: bookDetails.publisher || 'Unknown Publisher',
      year: bookDetails.year || 'Unknown Year',
      description: bookDetails.description || '',
      coverImage,
      md5: bookId,
      slowDownloadLinks,
      libgenLink
    };

    return NextResponse.json(bookData);
  } catch (error) {
    console.error('Error fetching book data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book data' },
      { status: 500 }
    );
  }
}