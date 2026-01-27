// Test Supabase connection and SDK functionality
import { supabase } from './src/lib/supabase-client.js';
import { customClient } from './src/lib/custom-sdk.js';

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('testimonials').select('*').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Sample data:', data);
    
    // Test custom SDK
    console.log('\n🧪 Testing custom SDK...');
    
    const testimonials = await customClient.entities.Testimonial.list();
    console.log('✅ Testimonial entity works!', testimonials.length, 'records found');
    
    const services = await customClient.entities.Service.list();
    console.log('✅ Service entity works!', services.length, 'records found');
    
    // Test auth
    console.log('\n🧪 Testing authentication...');
    const isAuth = await customClient.auth.isAuthenticated();
    console.log('🔐 Authentication status:', isAuth ? 'Authenticated' : 'Not authenticated');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  console.log('\n🎯 Migration test:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
});