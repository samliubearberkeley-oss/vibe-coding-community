import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://8kzgpze9.us-east.insforge.app'
});

export default client;

