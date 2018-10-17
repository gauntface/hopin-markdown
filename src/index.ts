import * as path from 'path';

import {logger} from './utils/logger';
import {marked} from './utils/marked-promise';
import {CustomRender, Token} from './custom-renderer';

export {Token};

export type Render = {
  html: string
  tokens: Array<Token>
}

export type RenderOpts = {
  staticDir?: string
}

export async function renderMarkdown(markdown: any, opts: RenderOpts = {}): Promise<Render> {
  if (typeof markdown != 'string') {
    throw new Error(`You must provide a string to renderMarkdown(); got ${JSON.stringify(markdown)}` );
  }

  if (opts.staticDir) {
    opts.staticDir = path.resolve(opts.staticDir);
  }

  const renderer = new CustomRender(opts.staticDir);
  const result = await marked(markdown, {renderer});
  const tokens = renderer.getTokens();
  return {
    html: result.trim(),
    tokens: tokens.sort(),
  };
}