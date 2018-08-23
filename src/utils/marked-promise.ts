import * as markedOrig from 'marked';

export function marked(src: string, options?: markedOrig.MarkedOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    markedOrig.parse(src, options, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    })
  })
}