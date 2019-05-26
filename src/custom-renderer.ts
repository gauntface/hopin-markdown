import * as marked from 'marked';
import * as prism from 'prismjs';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { parse, NodeType, TextNode, Node, HTMLElement } from 'node-html-parser';

import {logger} from './utils/logger';

const loadLanguages = require('prismjs/components/index');

const PRISM_LANGUAGES = [
  'javascript',
  'python',
  'css',
  'css-extras',
  'bash',
  'java',
  'go',
  'typescript',
  'php',
  'sass',
];

const SUPPORTED_LANGUAGES = [
  ...PRISM_LANGUAGES,
  'html',
  'xml',
];

// Prism does not load certain languages but will highlight them
// hence the seperate lists
loadLanguages(PRISM_LANGUAGES);

export class CustomRender extends marked.Renderer {
  private tokensUsed: Set<string>;
  private staticDir: string|null;

  constructor(staticDir: string|null) {
    super();
    this.staticDir = staticDir;
    this.tokensUsed = new Set<string>([]);
  }

  code(code: string, language: string, isEscaped: boolean): string {
    this.tokensUsed.add('pre');
    this.tokensUsed.add('code');

    // If it's an unknown / unsupported language, prevent extra markup that
    // won't get used.
    if (language && SUPPORTED_LANGUAGES.indexOf(language) === -1) {
      logger.warn(`lanugage '${language}' was not identified for syntax highlighting.`);
      language = null;
    }

    if (language) {
      const prismLang = prism.languages[language];
      try {
        code = prism.highlight(code, prismLang);
        isEscaped = true;
        this.tokensUsed.add('code-highlighted');
      } catch(err) {
        language = null;
        logger.warn(`An error occured while highlighting code with Prism:`, err);
      }
    }

    return super.code(code, language, isEscaped);
  }

  image(href: string, title: string, text: string): string {
    this.tokensUsed.add(`img`);

    if (path.extname(href) === '.gif') {
      this.tokensUsed.add(`async-img`);
      return `<img data-src="${href}" alt="${text}">`;
    }

    if (href.indexOf('http') === 0 || !this.staticDir) {
      // External image, no src-set
      return super.image(href, title, text);
    }

    const imgDir = path.join(this.staticDir, href);
    try {
      const stats = fs.statSync(imgDir);
      if (stats.isDirectory()) {
        const availableImages = glob.sync('*.*', {
          cwd: imgDir,
        });

        const nonWebPImages = availableImages.filter((availableImage) => {
          return !(path.extname(availableImage) === '.webp');
        });
        const webPImages = availableImages.filter((availableImage) => {
          return (path.extname(availableImage) === '.webp');
        });

        let largestSrc: string|null = null;
        let largestWidth = 0;
        const srcSet = nonWebPImages.map((imagePath) => {
          const imgUrl = path.join(
            href,
            imagePath
          );
          const imgWidth = Number(path.basename(imagePath, path.extname(imagePath)));

          if (!largestSrc || largestWidth < imgWidth) {
            largestSrc = imgUrl;
            largestWidth = imgWidth;
          }

          return `${imgUrl} ${imgWidth}w`;
        }).join(', ');

        const webpSrcSet = webPImages.map((imagePath) => {
          const imgUrl = path.join(
            href,
            imagePath
          );
          const imgWidth = Number(path.basename(imagePath, path.extname(imagePath)));

          return `${imgUrl} ${imgWidth}w`;
        }).join(', ');

        let htmlMarkup = '<picture>';
        if (webpSrcSet) {
          htmlMarkup += `<source srcset="${webpSrcSet}" type="image/webp">`;
        }
        htmlMarkup += `<source srcset="${srcSet}">`;
        htmlMarkup += `<img src="${largestSrc}" alt="${text}" />`;
        htmlMarkup += '</picture>';

        this.tokensUsed.add('picture');

        return htmlMarkup;
      }
    } catch (err) {
      // NOOP
    }
    return super.image(href, title, text);
  }

  // Methods are this are here just to collect tokens

  blockquote(quote: string): string {
    this.tokensUsed.add('blockquote');
    return super.blockquote(quote);
  }

  html(html: string): string {
    const tokens = getHTMLTags(html);
    for (const t of tokens) {
      if (!t) {
        continue;
      }
      this.tokensUsed.add(t.toLowerCase().trim());
    }
    return super.html(html);
  }

  heading(text: string, level: number, raw: string, slugger: marked.Slugger): string {
    const tokens: string[] = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`];
    this.tokensUsed.add(tokens[level - 1]);
    return super.heading(text, level, raw, slugger);
  }

  hr(): string {
    this.tokensUsed.add(`hr`);
    return super.hr();
  }

  list(body: string, ordered: boolean, start: number): string {
    this.tokensUsed.add(ordered ? `ol` : `ul`);
    return super.list(body, ordered, start);
  }

  listitem(text: string): string {
    this.tokensUsed.add(`li`);
    return super.listitem(text);
  }

  paragraph(text: string): string {
    this.tokensUsed.add(`p`);
    return super.paragraph(text);
  }

  table(header: string, body: string): string {
    this.tokensUsed.add(`table`);
    this.tokensUsed.add(`thead`);
    if (body) {
      this.tokensUsed.add(`tbody`);
    }
    return super.table(header, body);
  }

  tablerow(content: string): string {
    this.tokensUsed.add(`tr`);
    return super.tablerow(content);
  }

  tablecell(content: string, flags: {
      header: boolean;
      align: 'center' | 'left' | 'right' | null;
  }): string {
    this.tokensUsed.add(flags.header ? `th` : `td`);
    return super.tablecell(content, flags);
  }

  strong(text: string): string {
    this.tokensUsed.add(`strong`);
    return super.strong(text);
  }

  em(text: string): string {
    this.tokensUsed.add(`em`);
    return super.em(text);
  }

  codespan(code: string): string {
    this.tokensUsed.add(`code`);
    return super.codespan(code);
  }

  br(): string {
    this.tokensUsed.add('br');
    return super.br();
  }

  del(text: string): string {
    this.tokensUsed.add(`del`);
    return super.del(text);
  }

  link(href: string, title: string, text: string): string {
    this.tokensUsed.add(`a`);
    return super.link(href, title, text);
  }

  // Custom methods after this
  getTokens() {
    return Array.from(this.tokensUsed);
  }
}

function getHTMLTags(html: string): string[] {
  const root = parse(html);
  if (root.nodeType !== NodeType.ELEMENT_NODE) {
    return [];
  }

  const tags: string[] = [];
  const htmlRoot = root as HTMLElement;
  tags.push(htmlRoot.tagName);
  for (const c of htmlRoot.childNodes) {
    const ts = getHTMLTokensFromNode(c);
    tags.push(...ts);
  }
  return tags;
}

function getHTMLTokensFromNode(node: Node): string[] {
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    return [];
  }

  const tags: string[] = [];
  const htmlNode = node as HTMLElement;
  tags.push(htmlNode.tagName);
  for (const c of htmlNode.childNodes) {
    const ts = getHTMLTokensFromNode(c);
    tags.push(...ts);
  }
  return tags;
}