import * as prism from 'prismjs';

import {logger} from './utils/logger';

type HighlightedCode = {
  html: string
};

// TODO: Can we provide additional styles or notes on the procuded markdown?

export function highlightCode(code: string, lang: string): HighlightedCode {
  // If there is no lang here, we might be able to detect the language from the first line
  if (!lang) {
    const lines = code.split('\n');
    const firstLine = lines.splice(0,1)[0].trim();
    switch(firstLine) {
      case 'javascript': {
        lang = firstLine;
        code = lines.join('\n');
      }
      default:
        logger.debug(`No language detected in: ${firstLine}`);
    }
  }

  // If there is no lang here, then we can't highlight.
  if (!lang) {
    return {
      html: code,
    };
  }

  const prismLang = prism.languages[lang];
  if (!prismLang) {
    logger.warn(`Prism does not support language: ${lang}`);
    return {
      html: code,
    };
  }

  try {
    const highlightedCode = prism.highlight(code, prismLang, lang);
    return {
      html: highlightedCode,
    };
  } catch(err) {
    logger.warn(`An error occured while highlighting code with Prism:`, err);
    return {
      html: code,
    };
  }

  return {
    html: code,
  };
}