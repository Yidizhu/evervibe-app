(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EverTryAgreements = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const people = ['you', 'partner'];
  const words = {
    en: {
      heading: 'An agreement for us', placeholder: 'One small way we can care for each other…',
      label: 'Our agreement', propose: 'Propose this agreement', update: 'Propose this change',
      edit: 'Suggest a change', cancel: 'Keep the current proposal', withdraw: 'Withdraw',
      decline: 'Not this time', confirm: 'I’m willing to do this', waiting: 'For you both to confirm',
      confirmed: 'Confirmed', notYet: 'Not yet', agreed: 'Agreed together', empty: 'Write your idea first.',
      connect: 'Open a connection to make an agreement together.', duplicate: 'You have already agreed to this.',
      declined: 'The proposal has been set aside.', withdrawn: 'The proposal has been withdrawn.',
      proposed: 'Waiting for the other person.', revised: 'A new version is ready for you both.',
      newIdea: 'Another small promise', editing: 'A new version', limit: 'Keep it under 600 characters.',
      history: 'Our agreements', editingOther: 'A new proposal will replace the one above.'
    },
    zh: {
      heading: '我们的小约定', placeholder: '写下一件彼此照顾的小事…', label: '我们的约定',
      propose: '提出这个约定', update: '提出这次修改', edit: '换个说法', cancel: '保留当前提议',
      withdraw: '撤回提议', decline: '这次先不', confirm: '我愿意这样做', waiting: '等两个人一起确认',
      confirmed: '已确认', notYet: '待确认', agreed: '我们说好了', empty: '先写下你的想法吧。',
      connect: '打开一个相遇后，就能一起作约定。', duplicate: '这件事你们已经约定好了。',
      declined: '这次提议先放一放。', withdrawn: '提议已撤回。', proposed: '提议已经准备好，等对方看看。',
      revised: '新版本已准备好，请两个人重新确认。', newIdea: '再许一个小约定', editing: '新的说法',
      limit: '请控制在 600 字以内。', history: '我们的约定', editingOther: '新提议会替换上面的版本。'
    }
  };
  const normalized = value => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const clone = value => JSON.parse(JSON.stringify(value));

  // Session-only domain state. Shared agreements never depend on EVE being enabled.
  function createStore() {
    let serial = 0;
    let data;
    const reset = () => {
      data = { drafts: { you: '', partner: '' }, editing: { you: false, partner: false }, pending: null, accepted: [], notice: '' };
    };
    reset();
    const validActor = actor => people.includes(actor);
    const snapshot = () => clone(data);
    function setDraft(actor, value) {
      if (validActor(actor)) data.drafts[actor] = String(value).slice(0, 600);
    }
    function propose(actor) {
      if (!validActor(actor)) return false;
      const text = data.drafts[actor].trim();
      if (!text) { data.notice = 'empty'; return false; }
      if (data.accepted.some(item => normalized(item.text) === normalized(text))) {
        data.notice = 'duplicate'; return false;
      }
      if (data.pending && normalized(data.pending.text) === normalized(text)) {
        // An unchanged proposal must not reset or silently confirm anyone's choice.
        data.editing[actor] = false;
        data.notice = '';
        return false;
      }
      const revised = Boolean(data.pending);
      data.pending = { id: ++serial, text, author: actor, confirmations: { you: actor === 'you', partner: actor === 'partner' } };
      data.drafts[actor] = '';
      data.editing = { you: false, partner: false };
      data.notice = revised ? 'revised' : 'proposed';
      return true;
    }
    function beginEdit(actor) {
      if (!validActor(actor) || !data.pending) return false;
      data.drafts[actor] = data.pending.text;
      data.editing[actor] = true;
      data.notice = '';
      return true;
    }
    function cancelEdit(actor) {
      if (!validActor(actor)) return;
      data.editing[actor] = false;
      data.notice = '';
    }
    function confirm(actor) {
      if (!validActor(actor) || !data.pending || data.pending.confirmations[actor]) return false;
      data.pending.confirmations[actor] = true;
      if (people.every(person => data.pending.confirmations[person])) {
        data.accepted.unshift({ ...data.pending, confirmations: { you: true, partner: true } });
        data.accepted = data.accepted.slice(0, 10);
        data.pending = null;
        data.editing = { you: false, partner: false };
        data.notice = 'agreed';
      }
      return true;
    }
    function dismiss(actor) {
      if (!validActor(actor) || !data.pending) return false;
      data.notice = data.pending.author === actor ? 'withdrawn' : 'declined';
      data.pending = null;
      data.editing = { you: false, partner: false };
      return true;
    }
    return { snapshot, exportState:()=>({serial,data:clone(data)}), restore:value=>{reset();if(value){serial=value.serial;data=clone(value.data);}}, setDraft, propose, beginEdit, cancelEdit, confirm, dismiss, reset };
  }

  function create(options) {
    const { host, getContext, onChange = () => {} } = options;
    if (!host || typeof getContext !== 'function') throw new TypeError('An agreement host and context are required.');
    const store = createStore();
    let open = false;
    let historyOpen = false;
    const node = (tag, text, className) => {
      const element = document.createElement(tag);
      if (text != null) element.textContent = text;
      if (className) element.className = className;
      return element;
    };
    function context() {
      const current = getContext();
      const locale = current.locale === 'zh' ? 'zh' : 'en';
      return {
        ...current, locale, actor: current.actor === 'partner' ? 'partner' : 'you',
        names: {
          you: current.names?.you || (typeof current.you === 'string' && current.you) || (locale === 'zh' ? '我' : 'You'),
          partner: current.names?.partner || (typeof current.partner === 'string' && current.partner) || 'Anya'
        }
      };
    }
    function action(label, name, callback, primary = false) {
      const button = node('button', label, primary ? 'primary' : 'text-button');
      button.type = 'button';
      button.dataset.agreementAction = name;
      button.addEventListener('click', () => {
        if (!context().connected) return;
        callback();
        open = true;
        render();
        onChange(store.snapshot());
      });
      return button;
    }
    function render() {
      const current = context();
      const text = words[current.locale];
      const state = store.snapshot();
      const actor = current.actor;
      const oldInput = host.querySelector('textarea');
      const restoreFocus = oldInput && document.activeElement === oldInput;
      const selection = restoreFocus ? [oldInput.selectionStart, oldInput.selectionEnd] : null;
      const details = node('details', null, 'try-agreements');
      details.open = open;
      details.addEventListener('toggle', () => { open = details.open; });
      const summary = node('summary', text.heading);
      if (state.pending) summary.append(node('span', ' •', 'agreement-pending-dot'));
      details.append(summary);
      const body = node('div', null, 'agreement-body');
      details.append(body);
      if (!current.connected) body.append(node('p', text.connect, 'fine'));

      if (state.pending) {
        const pending = node('section', null, 'agreement-proposal');
        pending.dataset.agreementId = String(state.pending.id);
        pending.append(node('h4', text.waiting), node('p', state.pending.text, 'agreement-text'));
        const statuses = node('div', null, 'agreement-confirmations');
        people.forEach(person => {
          const status = node('span', `${current.names[person]}: ${state.pending.confirmations[person] ? text.confirmed : text.notYet}`);
          status.dataset.person = person;
          status.dataset.confirmed = String(state.pending.confirmations[person]);
          statuses.append(status);
        });
        pending.append(statuses);
        const actions = node('div', null, 'agreement-actions');
        if (!state.pending.confirmations[actor]) actions.append(action(text.confirm, 'confirm', () => store.confirm(actor), true));
        actions.append(action(text.edit, 'edit', () => store.beginEdit(actor)));
        actions.append(action(state.pending.author === actor ? text.withdraw : text.decline, 'dismiss', () => store.dismiss(actor)));
        actions.querySelectorAll('button').forEach(button => { button.disabled = !current.connected; });
        pending.append(actions);
        body.append(pending);
      }

      if (!state.pending || state.editing[actor]) {
        const form = node('form', null, 'agreement-form');
        const label = node('label', state.editing[actor] ? text.editing : text.label);
        const input = node('textarea');
        input.name = 'agreement';
        input.rows = 2;
        input.maxLength = 600;
        input.placeholder = text.placeholder;
        input.value = state.drafts[actor];
        input.disabled = !current.connected;
        input.dataset.agreementDraft = actor;
        input.addEventListener('input', () => store.setDraft(actor, input.value));
        label.append(input);
        form.append(label);
        const actions = node('div', null, 'agreement-actions');
        const submit = node('button', state.editing[actor] ? text.update : text.propose, 'primary');
        submit.type = 'submit';
        submit.dataset.agreementAction = 'propose';
        submit.disabled = !current.connected;
        actions.append(submit);
        if (state.editing[actor]) actions.append(action(text.cancel, 'cancel-edit', () => store.cancelEdit(actor)));
        form.append(actions);
        form.addEventListener('submit', event => {
          event.preventDefault();
          if (!context().connected) return;
          store.setDraft(actor, input.value);
          store.propose(actor);
          open = true;
          render();
          onChange(store.snapshot());
        });
        body.append(form);
      }
      const status = node('p', state.notice ? text[state.notice] : '', 'agreement-status fine');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      body.append(status);
      if (state.accepted.length) {
        const history = node('details', null, 'agreement-history');
        history.open = historyOpen;
        history.addEventListener('toggle', () => { historyOpen = history.open; });
        history.append(node('summary', `${text.history} · ${state.accepted.length}`));
        const list = node('ul');
        state.accepted.forEach(item => {
          const entry = node('li');
          entry.append(node('p', item.text, 'agreement-text'), node('span', `${current.names.you} + ${current.names.partner} · ${text.agreed}`, 'fine'));
          list.append(entry);
        });
        history.append(list);
        body.append(history);
      }
      host.replaceChildren(details);
      if (restoreFocus) {
        const nextInput = host.querySelector('textarea');
        if (nextInput && nextInput.dataset.agreementDraft === oldInput.dataset.agreementDraft) {
          nextInput.focus({ preventScroll: true });
          nextInput.setSelectionRange(...selection);
        }
      }
    }
    render();
    return {
      snapshot:()=>store.exportState(),
      restore(value){store.restore(value);open=false;historyOpen=false;render();},
      render,
      reset() { store.reset(); open = false; historyOpen = false; render(); },
      getState: store.snapshot
    };
  }
  return { create, createStore };
});
