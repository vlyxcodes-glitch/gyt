'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, ExternalLink, AlertCircle, BookOpen, Zap, Shield } from 'lucide-react';

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

export default function DownloadPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await fetch(`/api/download/${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book data');
        }
        const data = await response.json();
        setBookData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookData();
    }
  }, [bookId]);

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstantDownload = () => {
    if (bookData?.libgenLink) {
      window.open(bookData.libgenLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Skeleton className="aspect-[0.85] w-full" />
            </div>
            <div className="md:w-2/3 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No book data found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header with back to search */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Details</h1>
            <p className="text-gray-600">Download options and information</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Back to Search
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Image */}
          <div className="md:w-1/3">
            <Card className="overflow-hidden">
              <div className="aspect-[0.85] bg-gray-100 flex items-center justify-center">
                {bookData.coverImage ? (
                  <img
                    src={bookData.coverImage}
                    alt={bookData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <p class="text-gray-500 text-sm">Cover not available</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Cover not available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Book Information */}
          <div className="md:w-2/3 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {bookData.title}
              </h1>
              <p className="text-lg text-gray-600 mb-3">by {bookData.author}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {bookData.publisher && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {bookData.publisher}
                  </Badge>
                )}
                {bookData.year && (
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {bookData.year}
                  </Badge>
                )}
              </div>
            </div>

            {bookData.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {bookData.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instant Download Section */}
        <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Instant Download
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookData.libgenLink ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">LibGen Instant Access</span>
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    Get instant access through Library Genesis - faster and more reliable than manual downloads.
                  </p>
                  <Button
                    onClick={handleInstantDownload}
                    className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 text-lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Instant Download via LibGen
                  </Button>
                </div>
                
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Security Notice:</strong> LibGen links may contain ads. Please use an ad blocker and avoid clicking on suspicious ads. 
                    The download link typically requires clicking "GET" at the top of the page.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Instant Download Unavailable:</strong> Sorry, instant download option is not available for this book. 
                  Please download using the manual links below. Manual downloads may take more time, so please be patient.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Download Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-500" />
              Manual Download Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Slow Downloads:</strong> These are the manual download links from trusted partners. 
                Downloads may require browser verification and can have waitlists.
              </p>
              <p className="text-blue-700 text-xs">
                FAQ: <a href="/faq#slow" className="underline">Learn about slow downloads</a> | 
                Browser verification: <a href="/browser_verification" className="underline">More info</a>
              </p>
            </div>
            
            <div className="space-y-3">
              {bookData.slowDownloadLinks.map((link, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        Manual Download Link {index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {link.text}
                      </Badge>
                    </div>
                    {link.note && (
                      <p className="text-sm text-gray-600 italic">
                        Note: {link.note}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(link.url)}
                    className="whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
            
            {bookData.slowDownloadLinks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No manual download links available for this book.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">MD5 Hash:</span>
                <p className="font-mono text-gray-600 break-all">{bookData.md5}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <p className="text-gray-600">Anna's Archive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}