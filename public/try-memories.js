/* Session-only shared memories. No private EVE transcripts enter this module. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.EverTryMemories = api;
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const actors = new Set(['you', 'partner']);
  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(value + 'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && value <= today();
  }
  function createStore() {
    let serial = 0;
    const data = { pending: [], saved: [], water: 0, nourish: 0, usedWater: 0, usedNourish: 0 };
    function propose(actor, input, id) {
      if (!actors.has(actor)) throw new Error('actor');
      const title = String(input.title || '').trim().slice(0, 100);
      const text = String(input.text || '').trim().slice(0, 1500);
      const date = String(input.date || '');
      if (!title || !text || !validDate(date)) throw new Error('memory');
      const existing = id ? data.pending.find(m => m.id === id) : null;
      if (id && !existing) throw new Error('missing');
      if (existing && input.revision !== existing.revision) throw new Error('stale');
      const fingerprint = value => [value.title, value.text, value.date]
        .map(part => String(part).trim().replace(/\s+/g, ' ').toLowerCase()).join('\u0000');
      const content = fingerprint({ title, text, date });
      if ([...data.pending, ...data.saved].some(memory => memory.id !== id && fingerprint(memory) === content)) throw new Error('duplicate');
      const record = {
        id: id || `memory-${++serial}`, title, text, date,
        revision: (existing?.revision || 0) + 1,
        source: ['eve', 'plan'].includes(input.source) ? input.source : 'manual',
        planId: String(input.planId || '').slice(0, 180),
        author: existing?.author || actor,
        approvals: { you: actor === 'you', partner: actor === 'partner' }
      };
      if (existing) data.pending.splice(data.pending.indexOf(existing), 1, record);
      else data.pending.push(record);
      return record.id;
    }
    function confirm(actor, id) {
      if (!actors.has(actor)) return false;
      const record = data.pending.find(m => m.id === id);
      if (!record || record.approvals[actor]) return false;
      record.approvals[actor] = true;
      if (record.approvals.you && record.approvals.partner) {
        data.pending.splice(data.pending.indexOf(record), 1);
        data.saved.unshift({ ...record, approvals: { ...record.approvals } });
        data.water++; data.nourish++;
        return true;
      }
      return false;
    }
    function discard(id) {
      const index = data.pending.findIndex(m => m.id === id);
      if (index < 0) return false;
      data.pending.splice(index, 1); return true;
    }
    function care(kind) {
      if (!['water', 'nourish'].includes(kind) || data[kind] < 1) return false;
      data[kind]--;
      data[kind === 'water' ? 'usedWater' : 'usedNourish']++;
      return true;
    }
    function reset() {
      serial = 0; data.pending.length = 0; data.saved.length = 0;
      data.water = data.nourish = data.usedWater = data.usedNourish = 0;
    }
    return { data, propose, confirm, discard, care, reset,
      stage: () => data.saved.length >= 6 ? 3 : data.saved.length >= 3 ? 2 : data.saved.length ? 1 : 0 };
  }
  // A reviewed EVE draft is an extraction, not a claim that an outing happened.
  function sharedDraft(messages, names, simulatedLabel = 'simulated reply') {
    return (Array.isArray(messages) ? messages : [])
      .filter(m => actors.has(m.from) && typeof m.text === 'string' && m.text.trim())
      .slice(-4).map(m => `${names[m.from]}${m.simulated ? ` (${simulatedLabel})` : ''}: “${m.text.trim().slice(0, 270)}”`).join('\n\n');
  }
  const labels = {
    en: {
      heading: 'Our memories', subtitle: 'Little moments. A life taking root.', count: '{n} shared memories',
      new: 'Keep a moment', eve: 'Help keep this moment', empty: 'Our first memory is still ahead of us.',
      connect: 'Open the black box to start a shared space.', title: 'Give this moment a name',
      text: 'What would you like to remember?', date: 'Date', cancel: 'Cancel', propose: 'Share this memory',
      update: 'Update this memory', form: 'A moment from real life', planned: 'How did your time together go?',
      eveForm: 'EVE draft · from your shared conversation', eveTitle: 'Something we said to each other',
      review: 'For us both to keep', confirm: 'Keep this memory', waiting: 'Waiting for {name}',
      confirmed: 'Confirmed', edit: 'Edit', discard: 'Not this time', manual: 'From real life',
      shared: 'From our conversation', saved: 'Memory kept. +1 water · +1 nourishment',
      pending: 'Shared for the other person to review.', removed: 'Draft set aside.',
      water: 'Water the tree', nourish: 'Nourish the tree', watered: 'A little water. A little growth.',
      nourished: 'A little care. A new bloom.', required: 'Add a title, a memory and a date up to today.',
      noMessages: 'Talk together first, then EVE can help keep a moment.',
      duplicate: 'This moment is already waiting for confirmation or safely kept.',
      stale: 'This draft has changed. Open Edit below to review the latest version.',
      'tree.seed': 'A seed', 'tree.sprout': 'New leaves', 'tree.growing': 'Growing together', 'tree.mature': 'A life in bloom',
      'tree.zoomIn': 'Zoom in', 'tree.zoomOut': 'Zoom out', 'tree.reset': 'Reset view',
      'tree.drag': 'Drag to turn our tree', 'tree.aria': '{stage}. An interactive 3D memory tree.',
      'tree.unavailable': 'This browser cannot show the 3D tree.',
      'model.loading': 'Our tree is taking shape…', 'model.drag': 'Drag to rotate · Scroll to zoom',
      'model.unavailable': 'The tree is not ready. Please try again.'
    },
    zh: {
      heading: '共同记忆', subtitle: '小小的瞬间，慢慢长成我们的生活。', count: '{n} 段共同记忆',
      new: '留住这一刻', eve: '让 EVE 帮忙记录', empty: '我们的第一段记忆，还在前面。',
      connect: '打开黑盒，开始你们的共同空间。', title: '给这一刻起个名字',
      text: '有什么想要一起记住的？', date: '日期', cancel: '取消', propose: '分享这段记忆',
      update: '更新这段记忆', form: '现实中的一个瞬间', planned: '这次一起出门，怎么样？',
      eveForm: 'EVE 草稿 · 摘自共同聊天', eveTitle: '我们对彼此说过的话',
      review: '等我们一起确认', confirm: '一起留住', waiting: '等 {name} 确认',
      confirmed: '已确认', edit: '修改', discard: '这次先不留', manual: '现实里的瞬间',
      shared: '我们的聊天', saved: '记忆已留下。水 +1 · 肥料 +1',
      pending: '已分享，等对方一起确认。', removed: '已放下这份草稿。',
      water: '给树浇水', nourish: '给树施肥', watered: '一点水，一点成长。',
      nourished: '一点照料，一朵新花。', required: '请填写标题、记忆和不晚于今天的日期。',
      noMessages: '先一起聊一聊，EVE 就能帮你们留住片刻。',
      duplicate: '这一刻已经在等待确认，或已经留在共同记忆里了。',
      stale: '这份草稿已更新，点下方“修改”看看最新内容。',
      'tree.seed': '一颗种子', 'tree.sprout': '初生嫩芽', 'tree.growing': '并肩成长', 'tree.mature': '一生繁花',
      'tree.zoomIn': '放大', 'tree.zoomOut': '缩小', 'tree.reset': '重置视角',
      'tree.drag': '拖动旋转，看看我们的树', 'tree.aria': '{stage}，可旋转的三维记忆树',
      'tree.unavailable': '当前浏览器无法显示三维树。',
      'model.loading': '我们的树正在长出来…', 'model.drag': '拖动旋转 · 滚轮缩放',
      'model.unavailable': '树还没有准备好，请稍后再试。'
    }
  };
  function create({ host, getContext, onChange = () => {} }) {
    const store = createStore();
    const editors = { you: null, partner: null };
    const expanded = new Set();
    let treeDispose = null, renderEpoch = 0, animation = null, status = '', error = false, destroyed = false;
    const context = () => ({ locale: 'en', actor: 'you', names: { you: 'You', partner: 'Anya' }, ...getContext() });
    const t = (key, values = {}) => {
      let text = (labels[context().locale] || labels.en)[key] || key;
      for (const [k, v] of Object.entries(values)) text = text.replaceAll(`{${k}}`, v);
      return text;
    };
    // Try is a separate document from Stories. Reuse the renderer's translation
    // contract only when the document does not already provide one.
    if (!window.EverLocale) window.EverLocale = { t };
    function el(tag, cls, text) {
      const node = document.createElement(tag); if (cls) node.className = cls;
      if (text !== undefined) node.textContent = text; return node;
    }
    function button(text, action, cls = '', id) {
      const b = el('button', cls, text); b.type = 'button'; if (id) b.id = id;
      b.onclick = action; return b;
    }
    function notify(key, failed = false) { status = key; error = failed; }
    function changed() { onChange({ savedCount: store.data.saved.length, pendingCount: store.data.pending.length }); render(); }
    function stopTree() { renderEpoch++; treeDispose?.(); treeDispose = null; }
    function blank(source = 'manual') { return { title: '', text: '', date: today(), source, id: null, planId: '' }; }
    function openEditor(source) {
      const ctx = context(); if (!ctx.connected) return;
      let draft = blank(source);
      if (source === 'eve') {
        if (!ctx.eveEnabled) return;
        const quoted = sharedDraft(ctx.messages, ctx.names, ctx.locale === 'zh' ? '模拟回应' : 'simulated reply');
        if (!quoted) { notify('noMessages'); render(); return; }
        draft = { ...draft, title: t('eveTitle'), text: quoted };
      }
      editors[ctx.actor] = draft; status = ''; render();
      host.querySelector('#memory-title')?.focus({ preventScroll: true });
    }
    function mountTree(container) {
      const stage = store.stage(), ownEpoch = renderEpoch;
      const care = { count: store.data.usedWater + store.data.usedNourish,
        water: store.data.usedWater, nourish: store.data.usedNourish, animate: animation };
      container.dataset.stage = String(stage); animation = null;
      if (typeof window.mountEverTree === 'function') treeDispose = window.mountEverTree(container, stage, !!store.data.saved.length, care);
      if (stage === 3) {
        import('./tripo-viewer.js').then(({ mountModel }) => {
          if (destroyed || ownEpoch !== renderEpoch || host.hidden || !container.isConnected) return;
          treeDispose?.(); treeDispose = null;
          try { container.style.height = '340px'; treeDispose = mountModel(container, 'tree', null, 3, care); }
          catch { container.replaceChildren(); treeDispose = window.mountEverTree?.(container, stage, true, care); }
        }).catch(() => {});
      }
    }
    function careButton(kind) {
      const b = button('', () => {
        if (!store.care(kind)) return;
        animation = kind; notify(kind === 'water' ? 'watered' : 'nourished'); changed();
      }, 'memory-care-tool ' + kind, 'memory-' + kind);
      b.setAttribute('aria-label', `${t(kind)} · ${store.data[kind]}`); b.title = t(kind);
      b.disabled = store.data[kind] < 1;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 36'); svg.setAttribute('width', '26'); svg.setAttribute('height', '31'); svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = kind === 'water'
        ? '<path d="M16 2C12 9 5 15 5 22a11 11 0 0 0 22 0c0-7-7-13-11-20Z"/><path d="M10 22c0 4 3 6 6 6"/>'
        : '<path d="m11 3 10 0-3 7c7 5 10 10 10 15 0 8-24 8-24 0 0-5 3-10 10-15Z"/><path d="M12 11h8M16 27V17m0 6c-5 0-6-4-6-4 5-2 6 4 6 4Zm0-2c5 0 6-4 6-4-5-2-6 4-6 4Z"/>';
      b.append(svg, el('span', 'memory-care-count', String(store.data[kind]))); return b;
    }
    function editorForm(draft, ctx) {
      const form = el('form', 'memory-editor'); form.id = 'memory-editor';
      form.append(el('h3', '', t(draft.source === 'eve' ? 'eveForm' : draft.source === 'plan' ? 'planned' : 'form')));
      for (const [key, type, max] of [['title', 'text', 100], ['text', 'textarea', 1500], ['date', 'date', null]]) {
        const label = el('label', 'memory-field', t(key));
        const input = el(type === 'textarea' ? 'textarea' : 'input'); input.id = 'memory-' + key;
        if (type !== 'textarea') input.type = type;
        input.value = draft[key]; input.required = true;
        if (max) input.maxLength = max;
        if (key === 'date') input.max = today();
        if (key === 'text') input.rows = 4;
        input.oninput = () => { draft[key] = input.value; };
        label.append(input); form.append(label);
      }
      const actions = el('div', 'memory-actions');
      const submit = el('button', 'primary', t(draft.id ? 'update' : 'propose')); submit.type = 'submit'; submit.id = 'memory-propose';
      actions.append(submit, button(t('cancel'), () => { editors[ctx.actor] = null; render(); }, 'secondary'));
      form.append(actions);
      form.onsubmit = event => {
        event.preventDefault();
        try { store.propose(ctx.actor, draft, draft.id); editors[ctx.actor] = null; notify('pending'); changed(); }
        catch (problem) {
          const key = ['duplicate', 'stale'].includes(problem.message) ? problem.message : 'required';
          if (key === 'stale') editors[ctx.actor] = null;
          notify(key, true); render();
        }
      };
      return form;
    }
    function renderPending(ctx) {
      const list = el('div', 'memory-pending-list'); list.id = 'memory-pending';
      for (const memory of store.data.pending) {
        const card = el('article', 'memory-pending'); card.dataset.memoryId = memory.id;
        card.append(el('p', 'memory-eyebrow', t('review')), el('h3', '', memory.title), el('p', 'memory-body', memory.text));
        card.append(el('p', 'memory-meta', `${memory.date} · ${memory.source === 'eve' ? t('shared') : t('manual')}`));
        const statuses = el('p', 'memory-meta');
        statuses.textContent = ['you', 'partner'].map(actor => `${ctx.names[actor]}: ${memory.approvals[actor] ? t('confirmed') : '—'}`).join(' · ');
        card.append(statuses);
        const actions = el('div', 'memory-actions');
        if (!memory.approvals[ctx.actor]) actions.append(button(t('confirm'), () => {
          const saved = store.confirm(ctx.actor, memory.id);
          if (saved) {
            expanded.add(memory.id);
            for (const actor of actors) if (editors[actor]?.id === memory.id) editors[actor] = null;
          }
          notify(saved ? 'saved' : 'pending'); changed();
        }, 'primary', 'memory-confirm-' + memory.id));
        else card.append(el('p', 'memory-waiting', t('waiting', { name: ctx.names[ctx.actor === 'you' ? 'partner' : 'you'] })));
        actions.append(button(t('edit'), () => { editors[ctx.actor] = { ...memory }; status = ''; render(); }, 'secondary'));
        actions.append(button(t('discard'), () => { store.discard(memory.id); for (const actor of actors) if (editors[actor]?.id === memory.id) editors[actor] = null; notify('removed'); changed(); }, 'memory-link'));
        card.append(actions); list.append(card);
      }
      return list;
    }
    function render() {
      stopTree();
      if (destroyed || host.hidden || host.closest('[hidden]')) return;
      const ctx = context(); host.replaceChildren(); host.classList.add('try-memories');
      const heading = el('div', 'memory-heading');
      heading.append(el('h2', '', t('heading')), el('p', '', t('subtitle'))); host.append(heading);
      if (!ctx.connected) { host.append(el('p', 'memory-empty', t('connect'))); return; }
      const tree = el('div', 'memory-tree'); tree.id = 'memory-tree'; host.append(tree); mountTree(tree);
      const care = el('div', 'memory-care'); care.append(careButton('water'), careButton('nourish')); host.append(care);
      const statusEl = el('p', 'memory-status' + (error ? ' error' : ''), status ? t(status) : '');
      statusEl.id = 'memory-status'; statusEl.setAttribute('role', 'status'); host.append(statusEl);
      const actions = el('div', 'memory-actions memory-main-actions');
      actions.append(button(t('new'), () => openEditor('manual'), 'primary', 'memory-new'));
      const eve = button(t('eve'), () => openEditor('eve'), 'secondary', 'memory-eve');
      eve.hidden = !ctx.eveEnabled;
      eve.disabled = !ctx.eveEnabled || !sharedDraft(ctx.messages, ctx.names); actions.append(eve); host.append(actions);
      if (editors[ctx.actor]) host.append(editorForm(editors[ctx.actor], ctx));
      host.append(renderPending(ctx));
      const saved = el('section', 'memory-saved'); saved.id = 'memory-saved';
      if (!store.data.saved.length) saved.append(el('p', 'memory-empty', t('empty')));
      else {
        saved.append(el('p', 'memory-meta', (ctx.locale==='en' && store.data.saved.length===1 ? '1 shared memory' : t('count', { n: store.data.saved.length }))));
        for (const memory of store.data.saved) {
          const detail = el('details', 'memory-kept'); detail.open = expanded.has(memory.id); detail.dataset.memoryId = memory.id;
          const summary = el('summary', '', memory.title); detail.append(summary);
          detail.append(el('p', 'memory-meta', `${memory.date} · ${ctx.names[memory.author]} · ${memory.source === 'eve' ? t('shared') : t('manual')}`));
          detail.append(el('p', 'memory-body', memory.text));
          detail.ontoggle = () => { if (detail.open) expanded.add(memory.id); else expanded.delete(memory.id); };
          saved.append(detail);
        }
      }
      host.append(saved);
    }
    return {
      render,
      beginFromPlan(item) {
        const ctx = context(); if (!ctx.connected) return;
        editors[ctx.actor] = { ...blank('plan'), title: String(item?.title || item?.name || '').slice(0, 100), planId: String(item?.id || '') };
        status = ''; render();
      },
      reset() { store.reset(); editors.you = editors.partner = null; expanded.clear(); animation = null; status = ''; error = false; render(); },
      dispose() { destroyed = true; stopTree(); host.replaceChildren(); }
    };
  }
  return { create, createStore, sharedDraft, validDate };
});
