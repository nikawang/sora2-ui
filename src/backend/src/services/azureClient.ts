import OpenAI from 'openai';

/**
 * Azure OpenAI 配置接口
 */
export interface AzureConfig {
  endpoint: string;
  apiKey: string;
}

/**
 * 创建 Azure OpenAI 客户端
 * @param config Azure 配置
 * @returns OpenAI 客户端实例
 */
export function createAzureClient(config: AzureConfig): OpenAI {
  if (!config.endpoint || !config.apiKey) {
    throw new Error('Azure endpoint and API key are required');
  }

  // 确保 endpoint 有正确的格式
  let baseUrl = config.endpoint;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  if (!baseUrl.includes('/openai/')) {
    baseUrl += 'openai/';
  }
  if (!baseUrl.endsWith('/v1/')) {
    baseUrl += 'v1/';
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: baseUrl,
  });

  console.log(`✅ Azure OpenAI client created with endpoint: ${baseUrl}`);
  return client;
}

/**
 * 测试 Azure OpenAI 连接
 * @param config Azure 配置
 * @returns 连接是否成功
 */
export async function testAzureConnection(config: AzureConfig): Promise<boolean> {
  try {
    const client = createAzureClient(config);
    
    console.log('🔍 Testing Azure OpenAI connection...');
    console.log(`   Endpoint: ${config.endpoint}`);
    
    // 使用 videos.list() API 测试真实连接
    // 这会调用 GET /openai/v1/videos 来验证认证和连接
    const videosResponse = await client.videos.list({
      limit: 1  // 只获取1条记录，减少响应数据量
    });
    
    console.log('✅ Azure OpenAI connection test successful');
    console.log(`   Found ${videosResponse.data?.length || 0} videos in response`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Azure OpenAI connection test failed:', error.message || error);
    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    return false;
  }
}
