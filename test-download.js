// Test script for the download functionality
// Run with: node test-download.js

const testBookId = '13e33c7275522203c466cb84fb9795c8'; // Example MD5 hash
const baseUrl = 'http://localhost:3000';

async function testDownloadAPI() {
  console.log('🧪 Testing Download API...');
  
  try {
    // Test the API endpoint
    const response = await fetch(`${baseUrl}/api/download/${testBookId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received:');
    console.log('📚 Title:', data.title);
    console.log('✍️  Author:', data.author);
    console.log('🏢 Publisher:', data.publisher);
    console.log('📅 Year:', data.year);
    console.log('🖼️  Cover Image:', data.coverImage ? 'Available' : 'Not available');
    console.log('📝 Description:', data.description ? 'Available' : 'Not available');
    console.log('🔗 MD5:', data.md5);
    console.log('⚡ LibGen Link:', data.libgenLink ? 'Available' : 'Not available');
    console.log('📥 Slow Download Links:', data.slowDownloadLinks.length);
    
    // Test download links
    if (data.slowDownloadLinks.length > 0) {
      console.log('\n📥 Slow Download Links:');
      data.slowDownloadLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.text} - ${link.url}`);
      });
    }
    
    if (data.libgenLink) {
      console.log('\n⚡ Instant Download Link:');
      console.log(`   ${data.libgenLink}`);
    }
    
    console.log('\n✅ Download API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing download API:', error.message);
  }
}

async function testDownloadPage() {
  console.log('\n🌐 Testing Download Page...');
  
  try {
    // Test the page endpoint (this would open in a browser)
    const pageUrl = `${baseUrl}/download/${testBookId}`;
    console.log('📄 Download page URL:', pageUrl);
    console.log('ℹ️  Open this URL in a browser to test the page');
    
    // Test if the page responds
    const response = await fetch(pageUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Check if the page contains expected elements
    const hasTitle = html.includes('Download Book');
    const hasInstantDownload = html.includes('Instant Download');
    const hasManualDownload = html.includes('Manual Download Links');
    
    console.log('✅ Page response received');
    console.log('📚 Contains "Download Book":', hasTitle);
    console.log('⚡ Contains "Instant Download":', hasInstantDownload);
    console.log('📥 Contains "Manual Download Links":', hasManualDownload);
    
    console.log('\n✅ Download page test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing download page:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Download Feature Tests...\n');
  
  await testDownloadAPI();
  await testDownloadPage();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Manual Testing Checklist:');
  console.log('   1. Open http://localhost:3000 in your browser');
  console.log('   2. Search for any book');
  console.log('   3. Click on a book result');
  console.log('   4. Verify the download page loads correctly');
  console.log('   5. Check that book information is displayed');
  console.log('   6. Test download links if available');
  console.log('   7. Verify LibGen button appears when applicable');
}

// Run the tests
runAllTests().catch(console.error);