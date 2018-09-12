import {logger} from '@hopin/logger';

import {marked} from './utils/marked-promise';
import {CustomRender, Token} from './custom-renderer';

logger.setPrefix('[@hopin/markdown]');

export {Token};

export type Render = {
  html: string
  tokens: Array<Token>
}

export async function renderMarkdown(markdown: any): Promise<Render> {
  if (typeof markdown != 'string') {
    throw new Error(`You must provide a string to renderMarkdown(); got ${JSON.stringify(markdown)}` );
  }

  const renderer = new CustomRender();
  const result = await marked(markdown, {renderer});
  const tokens = renderer.getTokens();
  return {
    html: result.trim(),
    tokens: tokens.sort(),
  };
}