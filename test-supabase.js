// Simple Node.js script to test Supabase connection
const https = require('https');

const options = {
  hostname: 'wpprlyuxuqrinqefybatt.supabase.co',
  port: 443,
  path: '/rest/v1/tours?select=*&limit=1',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcHJseHVxdnJpbnFlZnliYXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDYwNzIsImV4cCI6MjA3NzY4MjA3Mn0.pxrLR9JcbpQcrEMjjSv2zkuztcWvgj-6u3uDib6IyNE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcHJseHVxdnJpbnFlZnliYXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDYwNzIsImV4cCI6MjA3NzY4MjA3Mn0.pxrLR9JcbpQcrEMjjSv2zkuztcWvgj-6u3uDib6IyNE'
  }
};

console.log('Testing Supabase connection...\n');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:');
    console.log(data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Supabase connection works!');
    } else {
      console.log('\n❌ ERROR! Status code:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ CONNECTION FAILED!');
  console.error('Error:', error.message);
  console.error('\nThis suggests a firewall, antivirus, or VPN is blocking the connection.');
});

req.end();
