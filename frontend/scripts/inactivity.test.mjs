import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
function app() {
  let now = 0, sequence = 0;
  const timers = new Map();
  const listeners = [];
  const panel = { innerHTML: 'poster', className: 'wait', addEventListener: (...args) => listeners.push(args) };
  const context = vm.createContext({
    document: { querySelector: () => panel, addEventListener() {} },
    setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(source, context);
  return {
    panel,
    run: code => vm.runInContext(code, context),
    interact(type) { listeners.filter(([event, , capture]) => event === type && capture).forEach(([, fn]) => fn({ buttons: 1 })); },
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

for (const screen of ['trail', 'pose-game pose-roll', 'dress']) {
  test(`${screen}: volta após 15 segundos sem interação e cancela tarefas pendentes`, () => {
    const game = app();
    game.run(`setScreen('${screen}', 'game'); after(20000, () => { throw Error('Tarefa de jogo encerrado'); })`);
    assert.equal((game.panel.innerHTML.match(/data-action="home"/g) || []).length, 1);
    game.advance(14999);
    assert.equal(game.panel.className, screen);
    game.advance(1);
    assert.equal(game.panel.className, 'wait');
    assert.equal(game.panel.innerHTML, 'poster');
    game.advance(10000);
  });
}

test('toques, arraste e teclado reiniciam os 15 segundos', () => {
  for (const event of ['pointerdown', 'pointermove', 'pointerup', 'click', 'keydown']) {
    const game = app();
    game.run("setScreen('dress', 'game')");
    game.advance(10000);
    game.interact(event);
    game.advance(14999);
    assert.equal(game.panel.className, 'dress', event);
    game.advance(1);
    assert.equal(game.panel.className, 'wait', event);
  }
});

test('comemoração tem só Home e volta automaticamente após 7 segundos', () => {
  const game = app();
  game.run("mode='choose'; celebrate(0)");
  assert.equal((game.panel.innerHTML.match(/<button/g) || []).length, 1);
  assert.match(game.panel.innerHTML, /data-action="home"/);
  game.advance(7000);
  assert.equal(game.panel.className, 'wait');
});
