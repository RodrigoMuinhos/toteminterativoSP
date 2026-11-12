import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../themes/transformers/src/app.js', import.meta.url), 'utf8');
function app() {
  let now = 0, sequence = 0;
  const timers = new Map(), listeners = [], nodes = new Map(), decodes = [];
  function node() {
    return { innerHTML: '', hidden: false, isConnected: true,
      style: { setProperty() {} }, classList: { add() {}, remove() {} },
      addEventListener() {},
      querySelector: selector => nodes.get(selector) || (nodes.set(selector, node()), nodes.get(selector)),
      replaceChildren() { this.innerHTML = ''; for (const value of nodes.values()) value.isConnected = false; }
    };
  }
  const panel = node();
  panel.addEventListener = (...args) => listeners.push(args);
  const context = vm.createContext({
    document: { querySelector: () => panel },
    window: { addEventListener() {} },
    matchMedia: () => ({ matches: true }),
    performance: { now: () => now },
    requestAnimationFrame(fn) { const id = ++sequence; timers.set(id, { fn: () => fn(now), at: now + 16 }); return id; },
    cancelAnimationFrame(id) { timers.delete(id); },
    Image: class { decode() { return new Promise(resolve => decodes.push(resolve)); } },
    setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(source, context);
  return {
    run: code => vm.runInContext(code, context), nodes,
    interact() { listeners.filter(([type, , capture]) => type === 'pointerdown' && capture).forEach(([, fn]) => fn()); },
    resolveFrames() { decodes.forEach(resolve => resolve()); },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at; timers.delete(next[0]); next[1].fn();
      }
      now = end;
    }
  };
}

for (const state of ['idle', 'scanning', 'select', 'transform', 'robot', 'squad', 'squad-win']) {
  test(`Transformers ${state}: retorna ao pôster após 15 segundos`, () => {
    const game = app();
    game.run(`display('${state}', '')`);
    assert.equal(game.nodes.get('.kioskHome').hidden, false);
    game.advance(14999);
    assert.equal(game.run('state'), state);
    game.advance(1);
    assert.equal(game.run('state'), 'poster');
    assert.equal(game.nodes.get('.kioskHome').hidden, true);
  });
}

test('Transformers: interação renova o prazo; animação automática não renova', () => {
  const game = app();
  game.run("display('select', '')");
  game.advance(10000);
  game.interact();
  game.advance(10000);
  game.run("display('robot', '')");
  game.advance(4999);
  assert.equal(game.run('state'), 'robot');
  game.advance(1);
  assert.equal(game.run('state'), 'poster');
});

test('Transformers: carregar imagens após sair não reabre o jogo encerrado', async () => {
  const game = app();
  game.run("display('select', '')");
  const pending = game.run('transformRobot(roster[0])');
  game.advance(15000);
  assert.equal(game.run('state'), 'poster');
  game.resolveFrames();
  await pending;
  game.advance(30000);
  assert.equal(game.run('state'), 'poster');
});

test('scan completo revela Optimus e volta ao pôster sem aguardar inatividade', () => {
  const game = app();
  game.run("display('idle', ''); startHold(1)");
  game.advance(7800);
  assert.equal(game.run('state'), 'complete');
  // Further touches must not postpone the automatic end of the animation.
  game.interact();
  game.advance(2300);
  assert.equal(game.run('state'), 'poster');
  assert.equal(game.run('charge'), 0);
  assert.equal(game.nodes.get('.poster-entry').disabled, false);
  game.advance(20000);
  assert.equal(game.run('state'), 'poster');
});

test('scan interrompido volta após 15 segundos sem interação', () => {
  const game = app();
  game.run("display('idle', ''); startHold(1)");
  game.advance(1500);
  game.run('endHold(1)');
  game.interact();
  game.advance(14999);
  assert.equal(game.run('state'), 'scanning');
  game.advance(1);
  assert.equal(game.run('state'), 'poster');
});

test('símbolo completo mostra o trio sem luzes, monta Optimus e retorna ao pôster', async () => {
  const game = app();
  game.run("squad=[roster[0],roster[1],roster[3]]; squadWin()");
  const lineup = game.nodes.get('.autobots').innerHTML;
  assert.equal((lineup.match(/class="squad-figure"/g) || []).length, 3);
  assert.doesNotMatch(lineup, /squad-eyes/);
  game.advance(2499);
  assert.equal(game.run('state'), 'squad-win');
  game.advance(1);
  assert.equal(game.run('state'), 'transform');
  assert.match(game.nodes.get('.autobots').innerHTML, /frames\/optimus\/0.webp/);
  game.resolveFrames();
  await game.run("loadFrames('optimus')");
  game.advance(1800);
  assert.equal(game.run('state'), 'robot');
  assert.equal(game.nodes.get('.tf-figure').src, 'frames/optimus/4.webp');
  assert.doesNotMatch(game.nodes.get('.autobots').innerHTML, /data-action="scan"/);
  game.advance(2300);
  assert.equal(game.run('state'), 'poster');
});

test('Home durante o trio cancela a montagem automática do Optimus', () => {
  const game = app();
  game.run("squad=[roster[0],roster[1],roster[3]]; squadWin()");
  game.advance(1000);
  game.run('reset()');
  game.advance(20000);
  assert.equal(game.run('state'), 'poster');
});

test('seletor navega em páginas separadas e não executa os dois totens', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="my-little-pony\/"/);
  assert.match(html, /href="transformers\/"/);
  assert.doesNotMatch(html, /<iframe|<script|target="_blank"/);
  for (const [theme, other] of [['my-little-pony', 'transformers'], ['transformers', 'my-little-pony']]) {
    const page = readFileSync(new URL(`../themes/${theme}/index.html`, import.meta.url), 'utf8');
    const script = readFileSync(new URL(`../themes/${theme}/src/app.js`, import.meta.url), 'utf8');
    assert.doesNotMatch(page + script, new RegExp(`(?:\.\./|/themes/)${other}/`));
  }
});
