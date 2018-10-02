import * as marked from 'marked';
import * as prism from 'prismjs';
import {logger} from '@hopin/logger';

export type TokenH1 = 'h1';
export type TokenH2 = 'h2';
export type TokenH3 = 'h3';
export type TokenH4 = 'h4';
export type TokenH5 = 'h5';
export type TokenH6 = 'h6';
export type TokenPre = 'pre';
export type TokenCode = 'code';
export type TokenCodeHighlighted = 'code-highlighted';
export type TokenImg = 'img';
export type TokenBlockQuote = 'blockquote';
export type TokenHTML = 'rawhtml';
export type TokenHR = 'hr';
export type TokenOL = 'ol';
export type TokenUL = 'ul';
export type TokenLI = 'li';
export type TokenP = 'p';
export type TokenStrong = 'strong';
export type TokenEM = 'em';
export type TokenBR = 'br';
export type TokenDel = 'del';
export type TokenA = 'a';
export type TokenTable = 'table';
export type TokenTHead = 'thead';
export type TokenTBody = 'tbody';
export type TokenTR = 'tr';
export type TokenTD = 'td';
export type TokenTH = 'th';

export type Token =
  TokenH1 |
  TokenH2 |
  TokenH3 |
  TokenH4 |
  TokenH5 |
  TokenH6 |
  TokenPre |
  TokenCode |
  TokenCodeHighlighted |
  TokenImg |
  TokenBlockQuote |
  TokenHTML |
  TokenHR |
  TokenOL |
  TokenUL |
  TokenLI |
  TokenP |
  TokenStrong |
  TokenEM |
  TokenBR |
  TokenDel |
  TokenA |
  TokenTable |
  TokenTHead |
  TokenTBody |
  TokenTR |
  TokenTD |
  TokenTH
;

const SupportedLanguages = [
  'javascript',
  'html',
];

export class CustomRender extends marked.Renderer {
  private tokensUsed: Set<Token>

  constructor() {
    super();
    this.tokensUsed = new Set<Token>([]);
  }

  code(code: string, language: string, isEscaped: boolean): string {
    this.tokensUsed.add('pre');
    this.tokensUsed.add('code');

    // If there is no lang here, we might be able to detect the language from the first line
    /* if (!language) {
      const lines = code.split('\n');
      const firstLine = lines.splice(0,1)[0].trim();
      switch(firstLine) {
        case 'javascript': {
          language = firstLine;
          code = lines.join('\n');
          break;
        }
        default:

      }
    }*/

    // If it's an unknown / unsupported language, prevent extra markup that
    // won't get used.
    if (language && SupportedLanguages.indexOf(language) == -1) {
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
    return super.image(href, title, text);
  }

  // Methods are this are here just to collect tokens

  blockquote(quote: string): string {
    this.tokensUsed.add('blockquote');
    return super.blockquote(quote);
  }

  html(html: string): string {
    this.tokensUsed.add('rawhtml');
    return super.html(html);
  }

  heading(text: string, level: number, raw: string): string {
    const tokens: Array<Token> = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`];
    this.tokensUsed.add(tokens[level - 1]);
    return super.heading(text, level, raw);
  }

  hr(): string {
    this.tokensUsed.add(`hr`);
    return super.hr();
  }

  list(body: string, ordered: boolean): string {
    this.tokensUsed.add(ordered ? `ol` : `ul`);
    return super.list(body, ordered);
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
    return super.br()
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
