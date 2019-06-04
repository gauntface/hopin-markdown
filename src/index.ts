import * as path from 'path';

import {marked} from './utils/marked-promise';
import {CustomRender} from './custom-renderer';

export type RenderOpts = {
  staticDir?: string
};

// tslint:disable-next-line:no-any
export async function renderMarkdown(markdown: any, opts: RenderOpts = {}): Promise<string> {
  if (typeof markdown !== 'string') {
    throw new Error(`You must provide a string to renderMarkdown(); got ${JSON.stringify(markdown)}` );
  }

  if (opts.staticDir) {
    opts.staticDir = path.resolve(opts.staticDir);
  }

  const renderer = new CustomRender(opts.staticDir);
  const result = await marked(markdown, {renderer});
  return result.trim();
}