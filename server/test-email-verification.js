// Test script for email verification endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:10000'; // Update this to your Render URL when testing production

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Endpoints\n');
  
  try {
    // Test 1: Send verification email
    console.log('1. Testing send verification email...');
    const sendResponse = await axios.post(`${BASE_URL}/send-verification`, {
      email: 'test@example.com'
    });
    console.log('✅ Send verification response:', sendResponse.data);
    
    // Test 2: Check verification status (should be false initially)
    console.log('\n2. Testing check verification status...');
    const statusResponse = await axios.get(`${BASE_URL}/verify-status?email=test@example.com`);
    console.log('✅ Status check response:', statusResponse.data);
    
    // Test 3: Test invalid email
    console.log('\n3. Testing invalid email...');
    try {
      await axios.post(`${BASE_URL}/send-verification`, {
        // missing email field
      });
    } catch (error) {
      console.log('✅ Invalid email handled correctly:', error.response.data);
    }
    
    // Test 4: Test missing email parameter for status check
    console.log('\n4. Testing missing email parameter...');
    try {
      await axios.get(`${BASE_URL}/verify-status`);
    } catch (error) {
      console.log('✅ Missing email parameter handled correctly:', error.response.data);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEmailVerification();
}

module.exports = { testEmailVerification };
