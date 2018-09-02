<h1  align="center">@hopin/markdown</h1>

<p align="center">
  <a href="https://travis-ci.org/gauntface/hopin-markdown"><img src="https://travis-ci.org/gauntface/hopin-markdown.svg?branch=master" alt="Travis Build Status" /></a>
  <a href="https://coveralls.io/github/gauntface/hopin-markdown?branch=master"><img src="https://coveralls.io/repos/github/gauntface/hopin-markdown/badge.svg?branch=master" alt="Coverage Status" /></a>
  <a href="https://david-dm.org/gauntface/hopin-markdown" title="dependencies status"><img src="https://david-dm.org/gauntface/hopin-markdown/status.svg"/></a>
  <a href="https://david-dm.org/gauntface/hopin-markdown?type=dev" title="devDependencies status"><img src="https://david-dm.org/gauntface/hopin-markdown/dev-status.svg"/></a>
  <a href="https://david-dm.org/gauntface/hopin-markdown?type=peer" title="peerDependencies status"><img src="https://david-dm.org/gauntface/hopin-markdown/peer-status.svg"/></a>
</p>

<p align="center">
`hopin-markdown` is a small helper library to render markdown as HTML with some extra bits thrown in.
</p>

<p align="center">
<img alt="Jake Hair" src="https://media.giphy.com/media/BAWzRp10SgBZ6/giphy.gif" />
</p>

## Installation

```
npm install @hopin/markdown --save
```


## Usage in Node

```javascript
const {renderMarkdown} = require('@hopin/markdown');

const result = renderMarkdown(`...markdown here...`);
console.log(`Result HTML: `, result.html);
console.log(`Tokens used in the final HTML: `, result.tokens);
```