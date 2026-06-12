import { searchUnaccent } from './src/lib/searchUtils';

async function main() {
  const result = await searchUnaccent('Post', ['title', 'content', 'authorName'], 'ký túc xá');
  console.log('RESULT:', result);
}

main().catch(console.error);
