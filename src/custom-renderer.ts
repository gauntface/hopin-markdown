import * as marked from 'marked';
import * as prism from 'prismjs';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

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
  private staticDir: string|null;
  private imgCache: string[];

  constructor(staticDir: string|null) {
    super();
    this.staticDir = staticDir;
    this.imgCache = [];
  }

  code(code: string, language: string, isEscaped: boolean): string {
    // If it's an unknown / unsupported language, prevent extra markup that
    // won't get used.
    if (language && SUPPORTED_LANGUAGES.indexOf(language) === -1) {
      logger.warn(`lanugage '${language}' was not identified for syntax highlighting.`);
      language = null;
    }

    if (language) {
      const prismLang = prism.languages[language];
      try {
        code = prism.highlight(code, prismLang, language);
        isEscaped = true;
      } catch(err) {
        language = null;
        logger.warn(`An error occured while highlighting code with Prism:`, err);
      }
    }

    return super.code(code, language, isEscaped);
  }

  image(href: string, title: string, text: string): string {
    let imgMarkup = super.image(href, title, text);
    if (href.indexOf('http') !== 0 && this.staticDir) {
      // Internal image and we have a static dir
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
            if (isNaN(imgWidth)) {
              return null;
            }
            if (!largestSrc || largestWidth < imgWidth) {
              largestSrc = imgUrl;
              largestWidth = imgWidth;
            }

            return `${imgUrl} ${imgWidth}w`;
          }).filter((value) => value != null).join(', ');

          const webpSrcSet = webPImages.map((imagePath) => {
            const imgUrl = path.join(
              href,
              imagePath
            );
            const imgWidth = Number(path.basename(imagePath, path.extname(imagePath)));
            if (isNaN(imgWidth)) {
              return null;
            }
            return `${imgUrl} ${imgWidth}w`;
          }).filter((value) => value != null).join(', ');

          let htmlMarkup = '<picture>';
          if (webpSrcSet) {
            htmlMarkup += `<source srcset="${webpSrcSet}" sizes="100vw" type="image/webp">`;
          }
          htmlMarkup += `<source srcset="${srcSet}" sizes="100vw">`;
          htmlMarkup += `<img src="${largestSrc}" alt="${text}" />`;
          htmlMarkup += '</picture>';

          imgMarkup = htmlMarkup;
        }
      } catch (err) {
        // NOOP
      }      
    }

    this.imgCache.push(imgMarkup);

    return imgMarkup;
  }

  // Methods are this are here just to collect tokens

  blockquote(quote: string): string {
    return super.blockquote(quote);
  }

  html(html: string): string {
    return super.html(html);
  }

  heading(text: string, level: number, raw: string, slugger: marked.Slugger): string {
    return super.heading(text, level, raw, slugger);
  }

  hr(): string {
    return super.hr();
  }

  list(body: string, ordered: boolean, start: number): string {
    return super.list(body, ordered, start);
  }

  listitem(text: string): string {
    return super.listitem(text);
  }

  paragraph(text: string): string {
    if (this.imgCache.indexOf(text) !== -1) {
      // If the paragraph contains one of our images, add
      // a utility class incase styling is desired.
      return `<p class="__hopin__u-img">${text}</p>`;
    }

    return super.paragraph(text);
  }

  table(header: string, body: string): string {
    return super.table(header, body);
  }

  tablerow(content: string): string {
    return super.tablerow(content);
  }

  tablecell(content: string, flags: {
      header: boolean;
      align: 'center' | 'left' | 'right' | null;
  }): string {
    return super.tablecell(content, flags);
  }

  strong(text: string): string {
    return super.strong(text);
  }

  em(text: string): string {
    return super.em(text);
  }

  codespan(code: string): string {
    return super.codespan(code);
  }

  br(): string {
    return super.br();
  }

  del(text: string): string {
    return super.del(text);
  }

  link(href: string, title: string, text: string): string {
    return super.link(href, title, text);
  }
}
