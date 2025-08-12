# Download Feature Documentation

## Overview

The download feature has been upgraded to provide a better user experience when downloading books from Anna's Archive. Instead of redirecting users directly to Anna's Archive URLs, users are now routed to our custom download page at `/download/[id]`.

## Features

### 1. Custom Download Page
- **URL Pattern**: `/download/[id]` where `[id]` is the book's MD5 hash
- **Purpose**: Provides a curated download experience with additional information and safety warnings

### 2. Book Information Display
The download page displays comprehensive book information:
- **Cover Image**: Automatically fetched from Anna's Archive or generated if missing
- **Title**: Full book title
- **Author**: Book author(s)
- **Publisher**: Publishing company
- **Year**: Publication year
- **Description**: Book description when available

### 3. Instant Download (LibGen Integration)
- **Special Button**: Prominent "Instant Download via LibGen" button when Library Genesis links are available
- **Visual Design**: Gradient background with hover effects and animations
- **Safety Warning**: Users are warned about potential ads and malicious software
- **Fallback**: Message displayed when LibGen links are not available

### 4. Manual Download Links
- **Section Title**: "Manual Download Links"
- **Content**: All slow download links extracted from the Anna's Archive page
- **Exclusions**: Fast download links are intentionally excluded
- **Interface**: Clean list with individual download buttons

### 5. LibGen Link Detection
The system automatically detects LibGen links using multiple indicators:
- Text containing "libgen" or "library genesis"
- URLs containing "libgen"
- Links with text containing "GET" and "top"
- Links followed by warning text about malicious software

## Technical Implementation

### Frontend Components
- **Page**: `src/app/download/[id]/page.tsx`
- **UI Components**: Uses shadcn/ui components (Card, Button, Badge, Alert, Skeleton)
- **Styling**: Tailwind CSS with gradient effects and animations
- **Icons**: Lucide React icons

### Backend API
- **Endpoint**: `src/app/api/download/[id]/route.ts`
- **Functionality**: 
  - Fetches Anna's Archive HTML content
  - Parses and extracts book information
  - Identifies download links
  - Detects LibGen links
  - Returns structured JSON data

### Data Flow
1. User clicks on a book from search results
2. Redirected to `/download/[md5-hash]`
3. Frontend fetches data from `/api/download/[md5-hash]`
4. Backend fetches Anna's Archive page
5. Backend parses HTML and extracts information
6. Backend returns structured data
7. Frontend displays the download page

## HTML Parsing Logic

### Book Information Extraction
- **Title**: Extracted from `<h1>` tags
- **Author**: Extracted from "Author(s):" field in book details
- **Publisher**: Extracted from "Publisher:" field
- **Year**: Extracted from "Year:" field
- **Description**: Extracted from book description section
- **Cover Image**: Extracted from `js-cover-image` class or fallback images

### Download Link Extraction
- **Slow Links**: All download links except fast ones
- **LibGen Links**: Detected using special patterns and text indicators
- **URL Processing**: Relative URLs converted to absolute URLs

### Text Cleaning
- HTML entities decoded (`&nbsp;`, `&amp;`, etc.)
- Whitespace normalization
- Text trimming and formatting

## User Experience Improvements

### Loading States
- Skeleton loaders for all content areas
- Smooth transitions between loading and loaded states

### Error Handling
- Graceful error messages
- Fallback content when data is missing
- Network error handling

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

### Visual Design
- Modern gradient backgrounds
- Glass morphism effects
- Smooth animations and transitions
- Hover effects on interactive elements

## Safety Features

### LibGen Warnings
- Clear warnings about potential ads
- Recommendation to use ad blockers
- Instructions to avoid suspicious links

### Link Validation
- All links are validated before display
- Malformed URLs are filtered out
- Duplicate links are removed

## Integration with Search

### Search Results Update
- Book cards now show "Download Book" instead of "View on Anna's Archive"
- Click handler redirects to `/download/[id]` instead of opening external URL
- Book ID uses MD5 hash instead of index

### Search API Changes
- Book extraction now includes MD5 hash as ID
- Improved URL parsing for MD5 extraction
- Maintains backward compatibility

## Testing

### Manual Testing
1. Perform a search on the main page
2. Click on any book result
3. Verify redirect to download page
4. Check book information display
5. Test download links functionality
6. Verify LibGen detection when available

### Automated Testing
- API endpoint testing
- HTML parsing validation
- Link extraction verification
- Error scenario handling

## Deployment

### Requirements
- No additional dependencies required
- Uses existing Next.js infrastructure
- Compatible with Vercel deployment

### Environment Variables
- No additional environment variables needed
- Uses existing ZAI web dev SDK configuration

## Future Enhancements

### Potential Improvements
- Caching for frequently accessed books
- Download progress tracking
- User download history
- Additional mirror sources
- Rating and review system

### Scalability
- Current implementation supports high traffic
- Efficient HTML parsing
- Minimal server load
- Fast response times

## Troubleshooting

### Common Issues
- **Parsing Errors**: Check HTML structure changes in Anna's Archive
- **Missing Images**: Verify image URL extraction logic
- **Broken Links**: Test link validation and URL construction
- **LibGen Detection**: Update pattern matching if needed

### Debug Mode
- Enable console logging for detailed parsing information
- Test with specific MD5 hashes
- Verify HTML content structure