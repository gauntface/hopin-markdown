import test from 'ava';
import * as path from 'path';
import * as sinon from 'sinon';
import * as prism from 'prismjs';

import {renderMarkdown} from '../build/index';

test('renderMarkdown() should throw for no string', async (t) => {
	try {
		await renderMarkdown();
	} catch (err) {
		t.deepEqual(err.message, 'You must provide a string to renderMarkdown(); got undefined');
	}
});

test('renderMarkdown() should throw for an object input', async (t) => {
	try {
		await renderMarkdown({});
	} catch (err) {
		t.deepEqual(err.message, 'You must provide a string to renderMarkdown(); got {}');
	}
});

test('renderMarkdown() should render HTML p heading', async (t) => {
	const render = await renderMarkdown('Hello World');
  t.deepEqual(render, '<p>Hello World</p>');
});

test('renderMarkdown() should render HTML h1 heading', async (t) => {
	const render = await renderMarkdown('# Hello World');
  t.deepEqual(render, '<h1 id="hello-world">Hello World</h1>');
});

test('renderMarkdown() should render HTML h2 heading', async (t) => {
	const render = await renderMarkdown('## Hello World');
  t.deepEqual(render, '<h2 id="hello-world">Hello World</h2>');
});

test('renderMarkdown() should render HTML h3 heading', async (t) => {
	const render = await renderMarkdown('### Hello World');
  t.deepEqual(render, '<h3 id="hello-world">Hello World</h3>');
});

test('renderMarkdown() should render HTML h4 heading', async (t) => {
	const render = await renderMarkdown('#### Hello World');
  t.deepEqual(render, '<h4 id="hello-world">Hello World</h4>');
});

test('renderMarkdown() should render HTML h5 heading', async (t) => {
	const render = await renderMarkdown('##### Hello World');
  t.deepEqual(render, '<h5 id="hello-world">Hello World</h5>');
});

test('renderMarkdown() should render HTML h6 heading', async (t) => {
	const render = await renderMarkdown('###### Hello World');
  t.deepEqual(render, '<h6 id="hello-world">Hello World</h6>');
});

test('renderMarkdown() should render inline code', async (t) => {
	const render = await renderMarkdown('Hello `World`');
  t.deepEqual(render, '<p>Hello <code>World</code></p>');
});

test('renderMarkdown() should render inline italics', async (t) => {
	const render = await renderMarkdown('Hello *World*');
  t.deepEqual(render, '<p>Hello <em>World</em></p>');
});

test('renderMarkdown() should render inline bold', async (t) => {
	const render = await renderMarkdown('Hello **World**');
  t.deepEqual(render, '<p>Hello <strong>World</strong></p>');
});

test('renderMarkdown() should render unordered list', async (t) => {
	const render = await renderMarkdown('- Hello World');
  t.deepEqual(render, '<ul>\n<li>Hello World</li>\n</ul>');
});

test('renderMarkdown() should render ordered list', async (t) => {
	const render = await renderMarkdown('1. Hello World');
  t.deepEqual(render, '<ol>\n<li>Hello World</li>\n</ol>');
});

test('renderMarkdown() should render plain code block', async (t) => {
	const render = await renderMarkdown('```\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
});

test('renderMarkdown() should syntax highlight Javascript code block', async (t) => {
	const render = await renderMarkdown('```javascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render, '<pre><code class="language-javascript">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">\'Hello World\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>');
});

/* test('renderMarkdown() should syntax highlight Javascript code block with first line entry', async (t) => {
	const render = await renderMarkdown('```\njavascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render, '<pre><code class="language-javascript">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">\'Hello World\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>');
});*/

test('renderMarkdown() should render plain code block for unknown language', async (t) => {
	const render = await renderMarkdown('```unknown\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
});

test('renderMarkdown() should render blockquote', async (t) => {
	const render = await renderMarkdown('> Hello World');
  t.deepEqual(render, '<blockquote>\n<p>Hello World</p>\n</blockquote>');
});

test('renderMarkdown() should render horizontal rule', async (t) => {
	const render = await renderMarkdown('---');
  t.deepEqual(render, '<hr>');
});

test('renderMarkdown() should render html', async (t) => {
	const render = await renderMarkdown('Hello World\n<div>This is HTML</div>');
  t.deepEqual(render, '<p>Hello World</p>\n<div>This is HTML</div>');
});

test('renderMarkdown() should render br', async (t) => {
	const render = await renderMarkdown('Hello  \nWorld');
  t.deepEqual(render, '<p>Hello<br>World</p>');
});

test('renderMarkdown() should render del', async (t) => {
	const render = await renderMarkdown('Hello ~~Matt~~World');
  t.deepEqual(render, '<p>Hello <del>Matt</del>World</p>');
});

test('renderMarkdown() should render link', async (t) => {
	const render = await renderMarkdown('[Hello World](https://gauntface.com/)');
  t.deepEqual(render, '<p><a href="https://gauntface.com/">Hello World</a></p>');
});

test('renderMarkdown() should render link with title', async (t) => {
	const render = await renderMarkdown('[Hello World](https://gauntface.com/ "Gauntface Home")');
  t.deepEqual(render, '<p><a href="https://gauntface.com/" title="Gauntface Home">Hello World</a></p>');
});

test('renderMarkdown() should render basic table', async (t) => {
  const render = await renderMarkdown(`
| Hello World |
| ----------- |
  `);
  t.deepEqual(render, '<table>\n<thead>\n<tr>\n<th>Hello World</th>\n</tr>\n</thead>\n</table>');
});

test('renderMarkdown() should render full table', async (t) => {
  const render = await renderMarkdown(`
| Hello  |
| ------ |
| World  |
  `);
  t.deepEqual(render, '<table>\n<thead>\n<tr>\n<th>Hello</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>World</td>\n</tr>\n</tbody></table>');
});

test('renderMarkdown() should render image', async (t) => {
  const render = await renderMarkdown(`![Alt Text](./images/example.png)`);
  t.deepEqual(render, '<p class="__hopin__u-img"><img src="./images/example.png" alt="Alt Text"></p>');
});

test('renderMarkdown() should render image with http:// at start as plain image', async (t) => {
  const render = await renderMarkdown(`![Alt Text](http://example.com/images/example.png)`);
  t.deepEqual(render, '<p class="__hopin__u-img"><img src="http://example.com/images/example.png" alt="Alt Text"></p>');
});

test('renderMarkdown() should render image as src set if image is available', async (t) => {
  const render = await renderMarkdown(`![Alt Text](/picture-sets/basic.jpg)`, {
    staticDir: path.join(__dirname, 'static'),
  });
  t.deepEqual(render, '<p class="__hopin__u-img"><picture><source srcset="/picture-sets/basic.jpg/1.webp 1w, /picture-sets/basic.jpg/2.webp 2w" sizes="100vw" type="image/webp"><source srcset="/picture-sets/basic.jpg/1.jpg 1w, /picture-sets/basic.jpg/2.jpg 2w" sizes="100vw"><img src="/picture-sets/basic.jpg/2.jpg" alt="Alt Text" /></picture></p>');
});

test('renderMarkdown() should handle the image being a file instead of a directory', async (t) => {
  const render = await renderMarkdown(`![Alt Text](/picture-sets/non-directory-image.jpg)`, {
    staticDir: path.join(__dirname, 'static'),
  });
  t.deepEqual(render, '<p class="__hopin__u-img"><img src="/picture-sets/non-directory-image.jpg" alt="Alt Text"></p>');
});

const sandbox = sinon.createSandbox();

test.beforeEach(() => {
    sandbox.restore();
});

test.afterEach.always(() => {
    sandbox.restore();
});

test.serial('renderMarkdown() should render plain code block if prism throws an error', async (t) => {
  const prism = require("prismjs");
  sandbox.stub(prism, 'highlight').callsFake(() => {
    throw new Error('prism.highlight() error');
  });

  const render = await renderMarkdown('```javascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
});