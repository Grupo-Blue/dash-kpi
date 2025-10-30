import { invokeLLM } from './server/_core/llm';

async function testLLM() {
  console.log('\n=== TESTING LLM API ===\n');
  
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Say hello in Portuguese.',
        },
      ],
      maxTokens: 100,
    });
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLLM();
