/**
 * Utility functions for markdown processing
 */

/**
 * Process code blocks in markdown to ensure proper language is specified
 * @param markdown The markdown string to process
 */
export const processCodeBlocks = (markdown: string): string => {
  // Match code blocks and add language identifier if missing
  return markdown.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'plaintext';
    return `\`\`\`${lang}\n${code}\`\`\``;
  });
};

/**
 * Extract all code snippets from a markdown text
 * @param markdown The markdown string to process
 * @returns Array of {language, code} objects
 */
export const extractCodeSnippets = (markdown: string) => {
  const regex = /```(\w+)\n([\s\S]*?)```/g;
  const snippets = [];
  let match;
  
  while ((match = regex.exec(markdown)) !== null) {
    snippets.push({
      language: match[1],
      code: match[2].trim()
    });
  }
  
  return snippets;
};

/**
 * Simple markdown sanitizer to prevent XSS
 * @param markdown The markdown string to sanitize
 */
export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  // This is a very basic sanitizer - for production use, consider a proper library
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, 'removed:');
};
