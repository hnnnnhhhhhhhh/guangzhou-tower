/* ==========================================================================
   单文件起手模板 · 函数
   用法：整段放进 HTML 末尾的 <script> 里，排在你自己的代码前面。不要改。
   ========================================================================== */
const kit = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

  // ---------- 格式化：日期、金额、数值都用它们，不要自己拼 ----------
  /** 日期：fmt.date(new Date()) → 11/20（斜杠小一档）。withWeek: true 时后面加“周四” */
  function date(d, {withWeek = false} = {}) {
    const x = d instanceof Date ? d : new Date(d);
    const week = withWeek ? ` <span class="t-small">周${'日一二三四五六'[x.getDay()]}</span>` : '';
    return `<span class="date">${x.getMonth() + 1}<i>/</i>${x.getDate()}</span>${week}`;
  }
  /** 时间：fmt.time(new Date()) → 09:30 */
  const time = (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return `<span class="num">${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}</span>`;
  };
  /** 金额：fmt.price(1218) → ¥1,218（符号小一档、基线对齐）。整数不显示小数 */
  function price(n, {symbol = '¥'} = {}) {
    const v = Number(n) || 0;
    const s = Number.isInteger(v) ? v.toLocaleString('zh-CN') : v.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return `<span class="price"><i>${esc(symbol)}</i>${s}</span>`;
  }
  /** 数值 + 单位：fmt.num(5.8, 'km') → 5.8 km（单位小一档） */
  const num = (n, unit = '') => `<span class="num">${esc(n)}${unit ? `<i>${esc(unit)}</i>` : ''}</span>`;
  /** 头像：没有真实头像时用名字的最后一个字 + 固定颜色 */
  function avatar(name, {size = '', src = ''} = {}) {
    const hue = [...String(name)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
    // 有英文字母取第一个字母（阿May → M），否则取最后一个字（小周 → 周）
    const latin = String(name).match(/[A-Za-z]/);
    const initial = latin ? latin[0].toUpperCase() : [...String(name)].slice(-1)[0] ?? '';
    const inner = src ? `<img src="${esc(src)}" alt="">` : esc(initial);
    return `<span class="avatar ${size}" style="--hue:${hue}" aria-hidden="true">${inner}</span>`;
  }

  // ---------- 图标：一套单色线条图标，不要用表情代替 ----------
  const P = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    share: '<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.3-5 6.5-5s5.7 1.6 6.5 5M16 4.5a3.5 3.5 0 010 7M18 15c2 .6 3.2 2.3 3.5 5"/>',
    bell: '<path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 1114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    star: '<path d="M12 4l2.5 5.2 5.5.8-4 3.9 1 5.6L12 16.8 7 19.5l1-5.6-4-3.9 5.5-.8z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    cart: '<path d="M4 5h2l2 11h10l2-8H7"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] ?? ''}</svg>`;

  // ---------- 弹层：带对话框语义、焦点留在弹层内、Esc 关闭 ----------
  let lastFocus = null;
  function sheet({title = '', body = '', onOpen} = {}) {
    closeSheet();
    lastFocus = document.activeElement;
    const id = 'sheet-title';
    const wrap = document.createElement('div');
    wrap.className = 'sheet-backdrop';
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${id}">
      <div class="sheet-head"><h2 class="t-title" id="${id}">${esc(title)}</h2>
      <button class="btn-icon" data-close aria-label="关闭">${icon('close')}</button></div>
      <div class="sheet-body" style="display:flex;flex-direction:column;gap:var(--s5)">${body}</div></div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) closeSheet(); });
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSheet();
      if (e.key !== 'Tab') return;
      const f = [...wrap.querySelectorAll('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    const first = wrap.querySelector('.sheet-body input, .sheet-body textarea, .sheet-body button') || wrap.querySelector('[data-close]');
    first?.focus();
    onOpen?.(wrap.querySelector('.sheet'));
    return wrap.querySelector('.sheet');
  }
  function closeSheet() {
    const w = document.querySelector('.sheet-backdrop');
    if (!w) return;
    w.remove();
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }
  /** 确认：await kit.confirm('删除这一项？', {ok: '删除', danger: true}) → true / false */
  function confirm(message, {ok = '确定', cancel = '取消', danger = false} = {}) {
    return new Promise((resolve) => {
      const s = sheet({title: message, body: `<div style="display:flex;flex-direction:column;gap:var(--s3)">
        <button class="${danger ? 'btn-danger' : 'btn'} block" data-ok>${esc(ok)}</button>
        <button class="btn-secondary block" data-cancel>${esc(cancel)}</button></div>`});
      s.querySelector('[data-ok]').onclick = () => { closeSheet(); resolve(true); };
      s.querySelector('[data-cancel]').onclick = () => { closeSheet(); resolve(false); };
    });
  }
  /** 轻提示：两秒后消失 */
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  // ---------- 本地存储 ----------
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 存储不可用时照常使用 */ } },
  };

  return {esc, fmt: {date, time, price, num, avatar}, icon, sheet, closeSheet, confirm, toast, store};
})();
