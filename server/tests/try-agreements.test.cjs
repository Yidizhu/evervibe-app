'use strict';
require('./offline.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the browser module's pure domain export without a DOM or network access.
const sandbox = { module: { exports: {} } };
vm.runInNewContext(readFileSync(path.join(__dirname, '../../public/try-agreements.js'), 'utf8'), sandbox);
const { createStore } = sandbox.module.exports;
const propose = (store, actor, text) => { store.setDraft(actor, text); return store.propose(actor); };
const accept = (store, text) => { propose(store, 'you', text); store.confirm('partner'); };

test('agreements require two different people to confirm and repeated clicks cannot duplicate acceptance', () => {
  const store = createStore();
  assert.equal(propose(store, 'you', 'Send a quick message when plans change.'), true);
  assert.equal(store.snapshot().pending.confirmations.you, true);
  assert.equal(store.snapshot().pending.confirmations.partner, false);
  assert.equal(store.confirm('you'), false);
  assert.equal(store.snapshot().accepted.length, 0);
  assert.equal(store.confirm('partner'), true);
  assert.equal(store.snapshot().pending, null);
  assert.equal(store.snapshot().accepted.length, 1);
  assert.equal(store.confirm('you'), false);
  assert.equal(store.confirm('partner'), false);
  assert.equal(store.snapshot().accepted.length, 1);
});

test('reproposing edited wording clears the previous person’s approval', () => {
  const store = createStore();
  propose(store, 'you', 'Call when plans change.');
  const firstId = store.snapshot().pending.id;
  assert.equal(store.beginEdit('partner'), true);
  assert.equal(store.snapshot().drafts.partner, 'Call when plans change.');
  propose(store, 'partner', 'Text first, then talk when we both have time.');
  const changed = store.snapshot().pending;
  assert.notEqual(changed.id, firstId);
  assert.equal(changed.author, 'partner');
  assert.equal(changed.confirmations.partner, true);
  assert.equal(changed.confirmations.you, false);
  assert.equal(store.snapshot().accepted.length, 0);
  store.confirm('you');
  assert.equal(store.snapshot().accepted[0].text, 'Text first, then talk when we both have time.');
});

test('unchanged wording and cancelled editing cannot silently confirm another person', () => {
  const store = createStore();
  propose(store, 'you', 'Make time for a walk.');
  store.beginEdit('partner');
  assert.equal(store.propose('partner'), false);
  assert.equal(store.snapshot().pending.confirmations.partner, false);
  assert.equal(store.snapshot().accepted.length, 0);
  store.beginEdit('partner');
  store.setDraft('partner', 'A different unsent idea');
  store.cancelEdit('partner');
  assert.equal(store.snapshot().pending.text, 'Make time for a walk.');
  assert.equal(store.snapshot().pending.confirmations.partner, false);
  assert.equal(store.snapshot().drafts.partner, 'A different unsent idea');
});

test('an accepted agreement cannot be recreated by case or whitespace changes', () => {
  const store = createStore();
  accept(store, 'Leave room for quiet time.');
  assert.equal(propose(store, 'partner', '  LEAVE   room for quiet time.  '), false);
  assert.equal(store.snapshot().notice, 'duplicate');
  assert.equal(store.snapshot().pending, null);
  assert.equal(store.snapshot().accepted.length, 1);
});

test('unfinished drafts belong to each actor and reset clears the complete session', () => {
  const store = createStore();
  accept(store, 'A promise already made');
  store.setDraft('you', 'My unfinished thought');
  store.setDraft('partner', 'Their unfinished thought');
  assert.equal(store.snapshot().drafts.you, 'My unfinished thought');
  assert.equal(store.snapshot().drafts.partner, 'Their unfinished thought');
  store.propose('partner');
  assert.equal(store.snapshot().drafts.you, 'My unfinished thought');
  store.reset();
  const clean = store.snapshot();
  assert.equal(clean.drafts.you, '');
  assert.equal(clean.drafts.partner, '');
  assert.equal(clean.editing.you, false);
  assert.equal(clean.editing.partner, false);
  assert.equal(clean.pending, null);
  assert.equal(clean.accepted.length, 0);
  assert.equal(clean.notice, '');
});

test('either person may decline or withdraw a proposal without erasing accepted agreements', () => {
  const store = createStore();
  accept(store, 'Keep our weekly walk');
  propose(store, 'you', 'A new suggestion');
  assert.equal(store.dismiss('partner'), true);
  assert.equal(store.snapshot().pending, null);
  assert.equal(store.snapshot().notice, 'declined');
  propose(store, 'partner', 'Another suggestion');
  assert.equal(store.dismiss('partner'), true);
  assert.equal(store.snapshot().notice, 'withdrawn');
  assert.equal(store.snapshot().accepted.length, 1);
  assert.equal(store.snapshot().accepted[0].text, 'Keep our weekly walk');
});

test('accepted history is bounded and keeps the latest ten promises in order', () => {
  const store = createStore();
  for (let index = 0; index < 12; index++) accept(store, `Promise ${index}`);
  const history = store.snapshot().accepted;
  assert.equal(history.length, 10);
  assert.equal(history[0].text, 'Promise 11');
  assert.equal(history[9].text, 'Promise 2');
  assert.equal(new Set(history.map(item => item.id)).size, 10);
});

test('a read snapshot cannot mutate an agreement or impersonate a confirmation', () => {
  const store = createStore();
  propose(store, 'you', 'Give each other room to finish speaking.');
  const snapshot = store.snapshot();
  snapshot.pending.text = 'Injected wording';
  snapshot.pending.confirmations.partner = true;
  snapshot.drafts.you = 'Injected draft';
  assert.equal(store.snapshot().pending.text, 'Give each other room to finish speaking.');
  assert.equal(store.snapshot().pending.confirmations.partner, false);
  assert.equal(store.snapshot().drafts.you, '');
  store.confirm('partner');
  const accepted = store.snapshot();
  accepted.accepted[0].text = 'Changed after confirmation';
  assert.equal(store.snapshot().accepted[0].text, 'Give each other room to finish speaking.');
});

test('blank proposals and unrecognised actors cannot create or approve an agreement', () => {
  const store = createStore();
  assert.equal(propose(store, 'you', '   '), false);
  assert.equal(store.snapshot().notice, 'empty');
  assert.equal(store.propose('eve'), false);
  store.setDraft('eve', 'An assistant must not promise for either person.');
  assert.equal(Object.hasOwn(store.snapshot().drafts, 'eve'), false);
  propose(store, 'partner', 'Our own choice');
  assert.equal(store.confirm('eve'), false);
  assert.equal(store.dismiss('eve'), false);
  assert.equal(store.snapshot().accepted.length, 0);
  assert.equal(store.snapshot().pending.confirmations.you, false);
});
