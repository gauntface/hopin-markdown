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
  t.deepEqual(render.html, '<p>Hello World</p>');
  t.deepEqual(render.tokens, ['p']);
});

test('renderMarkdown() should render HTML h1 heading', async (t) => {
	const render = await renderMarkdown('# Hello World');
  t.deepEqual(render.html, '<h1 id="hello-world">Hello World</h1>');
  t.deepEqual(render.tokens, ['h1']);
});

test('renderMarkdown() should render HTML h2 heading', async (t) => {
	const render = await renderMarkdown('## Hello World');
  t.deepEqual(render.html, '<h2 id="hello-world">Hello World</h2>');
  t.deepEqual(render.tokens, ['h2']);
});

test('renderMarkdown() should render HTML h3 heading', async (t) => {
	const render = await renderMarkdown('### Hello World');
  t.deepEqual(render.html, '<h3 id="hello-world">Hello World</h3>');
  t.deepEqual(render.tokens, ['h3']);
});

test('renderMarkdown() should render HTML h4 heading', async (t) => {
	const render = await renderMarkdown('#### Hello World');
  t.deepEqual(render.html, '<h4 id="hello-world">Hello World</h4>');
  t.deepEqual(render.tokens, ['h4']);
});

test('renderMarkdown() should render HTML h5 heading', async (t) => {
	const render = await renderMarkdown('##### Hello World');
  t.deepEqual(render.html, '<h5 id="hello-world">Hello World</h5>');
  t.deepEqual(render.tokens, ['h5']);
});

test('renderMarkdown() should render HTML h6 heading', async (t) => {
	const render = await renderMarkdown('###### Hello World');
  t.deepEqual(render.html, '<h6 id="hello-world">Hello World</h6>');
  t.deepEqual(render.tokens, ['h6']);
});

test('renderMarkdown() should render inline code', async (t) => {
	const render = await renderMarkdown('Hello `World`');
  t.deepEqual(render.html, '<p>Hello <code>World</code></p>');
  t.deepEqual(render.tokens, ['p', 'code'].sort());
});

test('renderMarkdown() should render inline italics', async (t) => {
	const render = await renderMarkdown('Hello *World*');
  t.deepEqual(render.html, '<p>Hello <em>World</em></p>');
  t.deepEqual(render.tokens, ['p', 'em'].sort());
});

test('renderMarkdown() should render inline bold', async (t) => {
	const render = await renderMarkdown('Hello **World**');
  t.deepEqual(render.html, '<p>Hello <strong>World</strong></p>');
  t.deepEqual(render.tokens, ['p', 'strong'].sort());
});

test('renderMarkdown() should render unordered list', async (t) => {
	const render = await renderMarkdown('- Hello World');
  t.deepEqual(render.html, '<ul>\n<li>Hello World</li>\n</ul>');
  t.deepEqual(render.tokens, ['ul', 'li'].sort());
});

test('renderMarkdown() should render ordered list', async (t) => {
	const render = await renderMarkdown('1. Hello World');
  t.deepEqual(render.html, '<ol start="undefined">\n<li>Hello World</li>\n</ol>');
  t.deepEqual(render.tokens, ['ol', 'li'].sort());
});

test('renderMarkdown() should render plain code block', async (t) => {
	const render = await renderMarkdown('```\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render.html, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
  t.deepEqual(render.tokens, ['pre', 'code'].sort());
});

test('renderMarkdown() should syntax highlight Javascript code block', async (t) => {
	const render = await renderMarkdown('```javascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render.html, '<pre><code class="language-javascript">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">\'Hello World\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>');
  t.deepEqual(render.tokens, ['pre', 'code', 'code-highlighted'].sort());
});

/* test('renderMarkdown() should syntax highlight Javascript code block with first line entry', async (t) => {
	const render = await renderMarkdown('```\njavascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render.html, '<pre><code class="language-javascript">console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">\'Hello World\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>');
  t.deepEqual(render.tokens, ['pre', 'code', 'code-highlighted'].sort());
});*/

test('renderMarkdown() should render plain code block for unknown language', async (t) => {
	const render = await renderMarkdown('```unknown\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render.html, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
  t.deepEqual(render.tokens, ['pre', 'code'].sort());
});

test('renderMarkdown() should render blockquote', async (t) => {
	const render = await renderMarkdown('> Hello World');
  t.deepEqual(render.html, '<blockquote>\n<p>Hello World</p>\n</blockquote>');
  t.deepEqual(render.tokens, ['blockquote', 'p'].sort());
});

test('renderMarkdown() should render horizontal rule', async (t) => {
	const render = await renderMarkdown('---');
  t.deepEqual(render.html, '<hr>');
  t.deepEqual(render.tokens, ['hr'].sort());
});

test('renderMarkdown() should render html', async (t) => {
	const render = await renderMarkdown('Hello World\n<div>This is HTML</div>');
  t.deepEqual(render.html, '<p>Hello World</p>\n<div>This is HTML</div>');
  t.deepEqual(render.tokens, ['p', 'rawhtml'].sort());
});

test('renderMarkdown() should render br', async (t) => {
	const render = await renderMarkdown('Hello  \nWorld');
  t.deepEqual(render.html, '<p>Hello<br>World</p>');
  t.deepEqual(render.tokens, ['p', 'br'].sort());
});

test('renderMarkdown() should render del', async (t) => {
	const render = await renderMarkdown('Hello ~~Matt~~World');
  t.deepEqual(render.html, '<p>Hello <del>Matt</del>World</p>');
  t.deepEqual(render.tokens, ['p', 'del'].sort());
});

test('renderMarkdown() should render link', async (t) => {
	const render = await renderMarkdown('[Hello World](https://gauntface.com/)');
  t.deepEqual(render.html, '<p><a href="https://gauntface.com/">Hello World</a></p>');
  t.deepEqual(render.tokens, ['p', 'a'].sort());
});

test('renderMarkdown() should render link with title', async (t) => {
	const render = await renderMarkdown('[Hello World](https://gauntface.com/ "Gauntface Home")');
  t.deepEqual(render.html, '<p><a href="https://gauntface.com/" title="Gauntface Home">Hello World</a></p>');
  t.deepEqual(render.tokens, ['p', 'a'].sort());
});

test('renderMarkdown() should render basic table', async (t) => {
  const render = await renderMarkdown(`
| Hello World |
| ----------- |
  `);
  t.deepEqual(render.html, '<table>\n<thead>\n<tr>\n<th>Hello World</th>\n</tr>\n</thead>\n</table>');
  t.deepEqual(render.tokens, ['table', 'thead', 'th', 'tr'].sort());
});

test('renderMarkdown() should render full table', async (t) => {
  const render = await renderMarkdown(`
| Hello  |
| ------ |
| World  |
  `);
  t.deepEqual(render.html, '<table>\n<thead>\n<tr>\n<th>Hello</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>World</td>\n</tr>\n</tbody></table>');
  t.deepEqual(render.tokens, ['table', 'tbody', 'thead', 'th', 'tr', 'td'].sort());
});

test('renderMarkdown() should render image', async (t) => {
  const render = await renderMarkdown(`![Alt Text](./images/example.png)`);
  t.deepEqual(render.html, '<p><img src="./images/example.png" alt="Alt Text"></p>');
  t.deepEqual(render.tokens, ['p', 'img'].sort());
});

const sandbox = sinon.createSandbox();

test.beforeEach(() => {
    sandbox.restore();
});

test.afterEach.always(() => {
    sandbox.restore();
});

test.serial('renderMarkdown() should render plain code block is prism throws an error', async (t) => {
  const prism = require("prismjs");
  sandbox.stub(prism, 'highlight').callsFake(() => {
    throw new Error('prism.highlight() error');
  });

  const render = await renderMarkdown('```javascript\nconsole.log(\'Hello World\');\n```');
  t.deepEqual(render.html, '<pre><code>console.log(&#39;Hello World&#39;);</code></pre>');
  t.deepEqual(render.tokens, ['pre', 'code'].sort());
});