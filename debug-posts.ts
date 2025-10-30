import { MetricoolService } from './server/services/integrations';

async function debugPosts() {
  const metricool = new MetricoolService();
  const blogId = '3890487'; // Tokeniza
  
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  
  console.log('\n=== DEBUGGING METRICOOL POSTS ===\n');
  
  // Instagram Posts
  const instaPosts = await metricool.getInstagramPosts(blogId, from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  console.log('Instagram Posts:', instaPosts.data.length);
  if (instaPosts.data.length > 0) {
    console.log('First Instagram Post:', JSON.stringify(instaPosts.data[0], null, 2));
  }
  
  // Facebook Posts
  const fbPosts = await metricool.getFacebookPosts(blogId, from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  console.log('\nFacebook Posts:', fbPosts.data.length);
  if (fbPosts.data.length > 0) {
    console.log('First Facebook Post:', JSON.stringify(fbPosts.data[0], null, 2));
  }
}

debugPosts().catch(console.error);
