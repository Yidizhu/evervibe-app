const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../public/try-memories.js'), 'utf8');
const memoryModule = { exports: {} };
vm.runInNewContext(source, { module: memoryModule, Date, Set, String });
const { createStore, sharedDraft, validDate } = memoryModule.exports;
const input = { title: 'The record shop', text: 'We found that album together.', date: '2026-01-02' };

test('a memory needs both people, rewards once, and grows after confirmation', () => {
  const store = createStore();
  const id = store.propose('you', input);
  assert.equal(store.stage(), 0);
  assert.equal(store.data.water, 0);
  assert.equal(store.confirm('you', id), false);
  assert.equal(store.data.saved.length, 0);
  assert.equal(store.confirm('partner', id), true);
  assert.equal(store.data.saved.length, 1);
  assert.equal(store.stage(), 1);
  assert.equal(store.data.water, 1);
  assert.equal(store.data.nourish, 1);
  assert.equal(store.confirm('partner', id), false);
  assert.equal(store.data.water, 1);
});
test('editing invalidates the earlier approval, including an edit by the other person', () => {
  const store = createStore();
  const id = store.propose('you', input);
  store.propose('partner', { ...input, text: 'We found a different album.', revision: 1 }, id);
  assert.equal(store.data.pending[0].approvals.you, false);
  assert.equal(store.data.pending[0].approvals.partner, true);
  assert.equal(store.confirm('partner', id), false);
  assert.equal(store.confirm('you', id), true);
  assert.equal(store.data.saved[0].text, 'We found a different album.');
});
test('recreating the same pending or saved memory cannot earn additional care', () => {
  const store = createStore();
  const id = store.propose('you', input);
  assert.throws(() => store.propose('partner', input), /duplicate/);
  store.confirm('partner', id);
  assert.throws(() => store.propose('you', { ...input, title: ' THE RECORD SHOP ', text: 'We found that album  together.' }), /duplicate/);
  assert.equal(store.data.saved.length, 1);
  assert.equal(store.data.water, 1);
});
test('an old open editor cannot overwrite a newer draft or its approvals', () => {
  const store = createStore();
  const id = store.propose('you', input);
  store.propose('partner', { ...input, text: 'Our updated memory.', revision: 1 }, id);
  assert.throws(() => store.propose('you', { ...input, text: 'Old editor contents.', revision: 1 }, id), /stale/);
  assert.equal(store.data.pending[0].text, 'Our updated memory.');
  assert.equal(store.data.pending[0].approvals.you, false);
  assert.equal(store.data.pending[0].approvals.partner, true);
});
test('discarded drafts cannot be confirmed or resurrected as edits', () => {
  const store = createStore();
  const id = store.propose('partner', input);
  assert.equal(store.discard(id), true);
  assert.equal(store.confirm('you', id), false);
  assert.throws(() => store.propose('you', input, id), /missing/);
  assert.equal(store.data.water, 0);
});
test('care cannot overspend and reset clears memories and care progress', () => {
  const store = createStore();
  assert.equal(store.care('water'), false);
  const id = store.propose('partner', input); store.confirm('you', id);
  assert.equal(store.care('water'), true);
  assert.equal(store.care('water'), false);
  assert.equal(store.care('__proto__'), false);
  assert.equal(store.data.water, 0);
  assert.equal(store.data.usedWater, 1);
  store.reset();
  assert.equal(store.stage(), 0);
  assert.equal(store.data.saved.length, 0);
  assert.equal(store.data.pending.length, 0);
  assert.equal(store.data.nourish, 0);
  assert.equal(store.data.usedWater, 0);
});
test('tree stages derive from saved memories, not pending drafts or care clicks', () => {
  const store = createStore();
  for (let i = 0; i < 6; i++) {
    const id = store.propose('you', { ...input, title: 'Moment ' + i });
    if (i === 5) assert.equal(store.stage(), 2);
    store.confirm('partner', id);
    if (i === 2) assert.equal(store.stage(), 2);
  }
  assert.equal(store.stage(), 3);
  assert.equal(store.data.water, 6);
});
test('EVE memory draft quotes participant messages and retains simulated attribution without adding events', () => {
  const text = sharedDraft([
    { from: 'you', text: 'Let’s go to the gallery tomorrow.' },
    { from: 'eve', text: 'You visited the gallery and loved it.' },
    { from: 'private', text: 'Never shared' },
    { from: 'partner', text: 'I like that idea.' }
  ], { you: 'You', partner: 'Anya' });
  assert.equal(text, 'You: “Let’s go to the gallery tomorrow.”\n\nAnya: “I like that idea.”');
  assert.equal(sharedDraft([], {}), '');
  assert.equal(sharedDraft([{from:'partner',text:'A quiet gallery sounds good.',simulated:true}], {partner:'Anya'}), 'Anya (simulated reply): “A quiet gallery sounds good.”');
  assert.equal(sharedDraft([{from:'partner',text:'去看看光影吧。',simulated:true}], {partner:'Anya'}, '模拟回应'), 'Anya (模拟回应): “去看看光影吧。”');
});
test('a remembered date must be real and cannot be in the future', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2999-01-01'), false);
  assert.equal(validDate('2024-02-29'), true);
  const store = createStore();
  assert.throws(() => store.propose('you', { ...input, text: '  ' }), /memory/);
  assert.throws(() => store.propose('eve', input), /actor/);
});
