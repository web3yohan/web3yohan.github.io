// assets/script.js

// ─── PROOFS (update paths/counts as you add images) ───
const PROOFS = {
  cicada:  ['/assets/images/pow/cicada/1.png',  '/assets/images/pow/cicada/2.png'],
  magverse: ['/assets/images/pow/magverse/1.png', '/assets/images/pow/magverse/2.png'],
  mner:    ['/assets/images/pow/mner/1.png',    '/assets/images/pow/mner/2.png'],
  gohome:  ['/assets/images/pow/gohome/1.png',  '/assets/images/pow/gohome/2.png'],
  uptopia: ['/assets/images/pow/uptopia/1.png', '/assets/images/pow/uptopia/2.png'],
};

const HIRE_CHAT_QUICK_REPLIES = [
  { id: 'schedule', label: 'Schedule a call', message: "I'd like to schedule a call with you." },
  { id: 'telegram', label: 'Telegram link?', message: "What's your Telegram username?" },
  { id: 'services', label: 'What do you do?', message: "What exactly do you do in Web3?" },
  { id: 'availability', label: 'Open to work?', message: 'Are you currently open to new projects?' }
];

const HIRE_CHAT_STORAGE_KEY = 'hireChatMessages';
const HIRE_CHAT_UPDATED_AT_KEY = 'hireChatLastUpdated';
const HIRE_CHAT_DISMISSED_CHIPS_KEY = 'hireChatDismissedChips';
const HIRE_CHAT_TTL_MS = 5 * 60 * 1000;
const HIRE_CHAT_GREETING = 'hey 👋 how can i help you grow?';
const HIRE_CHAT_INTENT_MATCHERS = {
  schedule: /\b(schedule|book|meeting|call|cal|calendar)\b/i,
  telegram: /\b(telegram|tg|@web3yohan|dm)\b/i,
  services: /\b(what do you do|services|service|offer|scope|help)\b/i,
  availability: /\b(open to work|open|available|availability|new projects?)\b/i
};

const hireChat = {
  open: false,
  isTyping: false,
  introTimer: null,
  replyTimer: null,
  closeTimer: null,
  refs: null,
  messages: [],
  dismissedChipIds: []
};

function initHireMeChat() {
  ensureHireChatModal();
  clearExpiredHireChatStorage();
  loadHireChatMessagesFromStorage();
  const hireBtns = document.querySelectorAll('#hireMeBtn');
  if (!hireBtns.length || !hireChat.refs) return;
  hireBtns.forEach(btn => {
    btn.addEventListener('click', () => openHireChat(btn));
  });
}

function ensureHireChatModal() {
  if (document.getElementById('hireChatModal')) {
    cacheHireChatRefs();
    return;
  }

  const chips = HIRE_CHAT_QUICK_REPLIES
    .map(reply => `<button class="hire-chat-chip" type="button" data-chip-id="${reply.id}" data-chip-message="${reply.message}">${reply.label}</button>`)
    .join('');

  document.body.insertAdjacentHTML('beforeend', `
    <div class="hire-chat-modal" id="hireChatModal" aria-hidden="true">
      <div class="hire-chat-panel" role="dialog" aria-modal="true" aria-label="Hire me chat">
        <div class="hire-chat-topbar">
          <button class="hire-chat-back" id="hireChatBackBtn" type="button" aria-label="Back">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>

          <div class="hire-chat-title-pill" aria-label="Chat status">
            <span class="hire-chat-title-name">Yohan</span>
            <span class="hire-chat-title-status">online</span>
          </div>

          <img class="hire-chat-profile" src="/assets/images/avatar-yohan-web.png" alt="Yohan profile" />
        </div>

        <div class="hire-chat-body" id="hireChatBody">
          <p class="hire-chat-day"><!--what day is it?--></p>
          <div class="hire-chat-messages" id="hireChatMessages"></div>
        </div>

        <div class="hire-chat-chip-wrap" id="hireChatChipWrap" hidden>
          <div class="hire-chat-chips" id="hireChatChips">${chips}</div>
        </div>

        <div class="hire-chat-input-wrap">
          <input id="hireChatInput" class="hire-chat-input" type="text" placeholder="Message Yohan..." autocomplete="off" />
          <button class="hire-chat-send" id="hireChatSendBtn" type="button" aria-label="Send message">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8L3 13.5V9.5L10.5 8L3 6.5V2.5L13.5 8Z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `);

  cacheHireChatRefs();
  bindHireChatEvents();
}

function cacheHireChatRefs() {
  hireChat.refs = {
    modal: document.getElementById('hireChatModal'),
    panel: document.querySelector('#hireChatModal .hire-chat-panel'),
    messages: document.getElementById('hireChatMessages'),
    chipsWrap: document.getElementById('hireChatChipWrap'),
    chips: document.getElementById('hireChatChips'),
    input: document.getElementById('hireChatInput'),
    sendBtn: document.getElementById('hireChatSendBtn'),
    body: document.getElementById('hireChatBody'),
    backBtn: document.getElementById('hireChatBackBtn')
  };
}

function bindHireChatEvents() {
  if (!hireChat.refs) return;

  hireChat.refs.modal.addEventListener('click', event => {
    if (event.target === hireChat.refs.modal) closeHireChat();
  });

  hireChat.refs.chips.addEventListener('click', event => {
    const chip = event.target.closest('[data-chip-id]');
    if (!chip || hireChat.isTyping) return;
    sendHireChatMessage(chip.dataset.chipMessage || '', chip.dataset.chipId || 'custom');
  });

  hireChat.refs.sendBtn.addEventListener('click', () => {
    sendHireChatMessage(hireChat.refs.input.value, 'custom');
  });

  if (hireChat.refs.backBtn) {
    hireChat.refs.backBtn.addEventListener('click', () => {
      closeHireChat();
    });
  }

  hireChat.refs.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendHireChatMessage(hireChat.refs.input.value, 'custom');
    }
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && hireChat.open) {
      event.preventDefault();
      closeHireChat();
    }
  });
}

function openHireChat(triggerEl) {
  if (!hireChat.refs || hireChat.open) return;
  if (hireChat.closeTimer) {
    window.clearTimeout(hireChat.closeTimer);
    hireChat.closeTimer = null;
  }
  clearExpiredHireChatStorage();
  loadHireChatMessagesFromStorage();
  prepareHireChatUI();
  hireChat.refs.modal.classList.remove('is-closing');
  hireChat.open = true;
  hireChat.refs.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('hire-chat-open');
  window.setTimeout(() => hireChat.refs.input.focus(), 320);

  if (hireChat.messages.length) {
    renderHireChatMessages();
    toggleHireChatChips(true);
    return;
  }

  startHireChatGreeting();
}

function closeHireChat() {
  if (!hireChat.refs || !hireChat.open) return;
  hireChat.open = false;
  hireChat.refs.modal.classList.add('is-closing');
  document.body.classList.remove('hire-chat-open');
  clearHireChatTimers();
  if (hireChat.closeTimer) window.clearTimeout(hireChat.closeTimer);
  hireChat.closeTimer = window.setTimeout(() => {
    if (!hireChat.refs) return;
    hireChat.refs.modal.classList.remove('is-closing');
    hireChat.refs.modal.setAttribute('aria-hidden', 'true');
    hireChat.closeTimer = null;
  }, 420);
}

function prepareHireChatUI() {
  clearHireChatTimers();
  if (!hireChat.refs) return;
  hireChat.refs.messages.innerHTML = '';
  hireChat.refs.input.value = '';
  toggleHireChatChips(false);
  removeTypingIndicator();
}

function startHireChatGreeting() {
  showTypingIndicator();
  hireChat.introTimer = window.setTimeout(() => {
    removeTypingIndicator();
    appendHireChatMessage('assistant', HIRE_CHAT_GREETING, { persist: true, animate: true });
    toggleHireChatChips(true);
  }, 1200);
}

function clearHireChatTimers() {
  if (hireChat.introTimer) {
    window.clearTimeout(hireChat.introTimer);
    hireChat.introTimer = null;
  }
  if (hireChat.replyTimer) {
    window.clearTimeout(hireChat.replyTimer);
    hireChat.replyTimer = null;
  }
}

function toggleHireChatChips(show) {
  if (!hireChat.refs) return;
  if (!show) {
    hireChat.refs.chipsWrap.hidden = true;
    return;
  }
  validateHireChatChipState();
  const visibleCount = hireChat.refs.chips.querySelectorAll('.hire-chat-chip:not([hidden])').length;
  hireChat.refs.chipsWrap.hidden = visibleCount === 0;
  if (show) scrollHireChatToBottom();
}

function showTypingIndicator() {
  if (!hireChat.refs) return;
  removeTypingIndicator();
  hireChat.isTyping = true;

  const row = document.createElement('div');
  row.className = 'hire-chat-msg hire-chat-msg--assistant hire-chat-typing-row is-visible';
  row.setAttribute('data-typing-indicator', 'true');
  row.innerHTML = `
    <div class="hire-chat-avatar hire-chat-avatar--mini">
      <img class="hire-chat-avatar-image" src="/assets/images/avatar-yohan-web.png" alt="Yohan avatar" />
    </div>
    <div class="hire-chat-bubble hire-chat-bubble--assistant hire-chat-bubble--typing">
      <span></span><span></span><span></span>
    </div>
  `;
  hireChat.refs.messages.appendChild(row);
  scrollHireChatToBottom();
}

function removeTypingIndicator() {
  if (!hireChat.refs) return;
  hireChat.isTyping = false;
  const typingNode = hireChat.refs.messages.querySelector('[data-typing-indicator="true"]');
  if (typingNode) typingNode.remove();
  scrollHireChatToBottom();
}

function appendHireChatMessage(role, text, options = {}) {
  const settings = { persist: true, animate: true, ...options };
  const message = { role, content: text };
  hireChat.messages.push(message);
  validateHireChatChipState();
  if (settings.persist) saveHireChatMessagesToStorage();
  appendHireChatMessageToUI(message, settings.animate);
}

function appendHireChatMessageToUI(message, animate) {
  if (!hireChat.refs) return;
  const row = document.createElement('div');
  row.className = `hire-chat-msg hire-chat-msg--${message.role}`;

  if (message.role === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'hire-chat-avatar hire-chat-avatar--mini';
    const avatarImage = document.createElement('img');
    avatarImage.className = 'hire-chat-avatar-image';
    avatarImage.src = '/assets/images/avatar-yohan-web.png';
    avatarImage.alt = 'Yohan avatar';
    avatar.appendChild(avatarImage);
    row.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = `hire-chat-bubble hire-chat-bubble--${message.role}`;
  renderHireChatBubbleContent(bubble, message.content);
  row.appendChild(bubble);
  hireChat.refs.messages.appendChild(row);

  if (animate) {
    window.requestAnimationFrame(() => row.classList.add('is-visible'));
  } else {
    row.classList.add('is-visible');
  }
  scrollHireChatToBottom();
}

function renderHireChatBubbleContent(bubble, text) {
  const source = typeof text === 'string' ? text : '';
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(source)) !== null) {
    const start = match.index;
    const url = match[0];

    if (start > lastIndex) {
      bubble.appendChild(document.createTextNode(source.slice(lastIndex, start)));
    }

    const link = document.createElement('a');
    link.className = 'hire-chat-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = url;
    bubble.appendChild(link);

    lastIndex = start + url.length;
  }

  if (lastIndex < source.length) {
    bubble.appendChild(document.createTextNode(source.slice(lastIndex)));
  }
}

function getHireChatHistoryForProxy() {
  const raw = sessionStorage.getItem(HIRE_CHAT_STORAGE_KEY);
  if (!raw) {
    return hireChat.messages.map(message => ({
      role: message.role === 'assistant' ? 'bot' : 'user',
      text: message.content
    }));
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && typeof item.content === 'string' && (item.role === 'assistant' || item.role === 'user'))
      .map(item => ({
        role: item.role === 'assistant' ? 'bot' : 'user',
        text: item.content
      }));
  } catch {
    return [];
  }
}

async function fetchHireChatReply(userText) {
  const chatHistoryArray = getHireChatHistoryForProxy();
  const response = await fetch('https://yohan-proxy-chat.senpaiff089.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userText,
      history: chatHistoryArray
    })
  });

  if (!response.ok) throw new Error('network error');
  const data = await response.json();
  return data.reply;
}

function sendHireChatMessage(rawText, source) {
  if (!hireChat.refs || hireChat.isTyping) return;
  const text = (rawText || '').trim();
  if (!text) return;

  hireChat.refs.input.value = '';
  dismissMatchingChipsFromText(text, source);
  appendHireChatMessage('user', text, { persist: true, animate: true });
  toggleHireChatChips(false);
  showTypingIndicator();

  const replyPromise = fetchHireChatReply(text).catch(() => 'I hit a network issue for a moment. Please try again in a few seconds.');
  const typingDelay = 1500 + Math.floor(Math.random() * 501);

  hireChat.replyTimer = window.setTimeout(async () => {
    const response = await replyPromise;
    removeTypingIndicator();
    appendHireChatMessage('assistant', response, { persist: true, animate: true });
    toggleHireChatChips(true);
  }, typingDelay);
}

function scrollHireChatToBottom() {
  if (!hireChat.refs) return;
  hireChat.refs.body.scrollTop = hireChat.refs.body.scrollHeight;
}

function renderHireChatMessages() {
  if (!hireChat.refs) return;
  hireChat.refs.messages.innerHTML = '';
  hireChat.messages.forEach(message => {
    appendHireChatMessageToUI(message, false);
  });
}

function hasHireChatUserMessage() {
  return hireChat.messages.some(message => message.role === 'user');
}

function saveHireChatMessagesToStorage() {
  sessionStorage.setItem(HIRE_CHAT_STORAGE_KEY, JSON.stringify(hireChat.messages));
  sessionStorage.setItem(HIRE_CHAT_UPDATED_AT_KEY, String(Date.now()));
  sessionStorage.setItem(HIRE_CHAT_DISMISSED_CHIPS_KEY, JSON.stringify(hireChat.dismissedChipIds));
}

function loadHireChatMessagesFromStorage() {
  const raw = sessionStorage.getItem(HIRE_CHAT_STORAGE_KEY);
  loadDismissedHireChatChips();
  if (!raw) {
    hireChat.messages = [];
    validateHireChatChipState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      hireChat.messages = [];
      return;
    }
    hireChat.messages = parsed
      .filter(item => item && (item.role === 'assistant' || item.role === 'user') && typeof item.content === 'string')
      .map(item => ({ role: item.role, content: item.content }));
    validateHireChatChipState();
    if (hireChat.messages.length && !sessionStorage.getItem(HIRE_CHAT_UPDATED_AT_KEY)) {
      sessionStorage.setItem(HIRE_CHAT_UPDATED_AT_KEY, String(Date.now()));
    }
  } catch {
    hireChat.messages = [];
    validateHireChatChipState();
  }
}

function clearExpiredHireChatStorage() {
  const updatedAt = Number(sessionStorage.getItem(HIRE_CHAT_UPDATED_AT_KEY) || 0);
  if (!updatedAt) return;
  if (Date.now() - updatedAt <= HIRE_CHAT_TTL_MS) return;
  sessionStorage.removeItem(HIRE_CHAT_STORAGE_KEY);
  sessionStorage.removeItem(HIRE_CHAT_UPDATED_AT_KEY);
  sessionStorage.removeItem(HIRE_CHAT_DISMISSED_CHIPS_KEY);
  hireChat.messages = [];
  hireChat.dismissedChipIds = [];
}

function loadDismissedHireChatChips() {
  const raw = sessionStorage.getItem(HIRE_CHAT_DISMISSED_CHIPS_KEY);
  if (!raw) {
    hireChat.dismissedChipIds = [];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    hireChat.dismissedChipIds = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    hireChat.dismissedChipIds = [];
  }
}

function dismissMatchingChipsFromText(text, source) {
  const ids = new Set(hireChat.dismissedChipIds);
  if (source && source !== 'custom') ids.add(source);
  const lowerText = text.toLowerCase();
  Object.entries(HIRE_CHAT_INTENT_MATCHERS).forEach(([chipId, pattern]) => {
    if (pattern.test(lowerText)) ids.add(chipId);
  });
  hireChat.dismissedChipIds = Array.from(ids);
  validateHireChatChipState();
}

function validateHireChatChipState() {
  if (!hireChat.refs?.chips) return;
  const ids = new Set(hireChat.dismissedChipIds);
  hireChat.messages
    .filter(message => message.role === 'user')
    .forEach(message => {
      const text = message.content.toLowerCase();
      Object.entries(HIRE_CHAT_INTENT_MATCHERS).forEach(([chipId, pattern]) => {
        if (pattern.test(text)) ids.add(chipId);
      });
    });
  hireChat.dismissedChipIds = Array.from(ids);
  sessionStorage.setItem(HIRE_CHAT_DISMISSED_CHIPS_KEY, JSON.stringify(hireChat.dismissedChipIds));
  hireChat.refs.chips.querySelectorAll('.hire-chat-chip').forEach(chip => {
    chip.hidden = ids.has(chip.dataset.chipId || '');
  });
}

function renderProofThumbs() {
  const grids = document.querySelectorAll('.work-proof-grid');
  if (!grids.length) return;
  grids.forEach(grid => {
    const projectKey = grid.querySelector('[data-open-proof]')?.dataset.openProof;
    const proofSet = projectKey ? PROOFS[projectKey] : null;
    if (!projectKey || !proofSet || !proofSet.length) return;
    grid.innerHTML = proofSet
      .map((src, idx) => (
        `<button class="proof-thumb" data-open-proof="${projectKey}" data-index="${idx}">
          <img src="${src}" alt="${projectKey} proof ${idx + 1}" />
          <span class="proof-label">View proof</span>
        </button>`
      ))
      .join('');
  });
}

// ─── LIGHTBOX ───
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lbImg');
const lbCount = document.getElementById('lbCounter');

let lbSet   = [];
let lbIndex = 0;

function lbOpen(key, idx) {
  lbSet   = PROOFS[key] || [];
  lbIndex = Math.max(0, Math.min(idx, lbSet.length - 1));
  if (!lbSet.length || !lb) return;
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbRender();
}
function lbClose() {
  if (!lb) return;
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function lbRender() {
  lbImg.src = lbSet[lbIndex];
  if (lbCount) lbCount.textContent = `${lbIndex + 1} / ${lbSet.length}`;
}

document.addEventListener('click', e => {
  // proof thumbnail buttons (Work page)
  const thumb = e.target.closest('[data-open-proof]');
  if (thumb) {
    lbOpen(thumb.dataset.openProof, Number(thumb.dataset.index || 0));
    return;
  }
  if (e.target.closest('[data-lb-prev]')) { if (lbIndex > 0) { lbIndex--; lbRender(); } return; }
  if (e.target.closest('[data-lb-next]')) { if (lbIndex < lbSet.length - 1) { lbIndex++; lbRender(); } return; }
  if (e.target.closest('[data-lb-close]') || e.target.classList.contains('lb-backdrop')) lbClose();
});

document.addEventListener('keydown', e => {
  if (!lb || lb.getAttribute('aria-hidden') === 'true') return;
  if (e.key === 'Escape')      lbClose();
  if (e.key === 'ArrowLeft'  && lbIndex > 0)                lbIndex--, lbRender();
  if (e.key === 'ArrowRight' && lbIndex < lbSet.length - 1) lbIndex++, lbRender();
});

// ─── SCROLL REVEAL ───
window.addEventListener('load', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const targets = document.querySelectorAll(
    '.section-tag, .section-heading, .about-body, .stat-row, ' +
    '.project-card, .work-block, .contact-card, .cta-heading, .page-title, .page-sub, ' +
    '.skills-inner'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(el => obs.observe(el));

  // Immediately trigger animation for elements already in view on page load
  setTimeout(() => {
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
        obs.unobserve(el);
      }
    });
  }, 0);
});

(function initGlobalEntrance() {
  const sequenceTargets = document.querySelectorAll('.page-hero .section-tag, .page-hero .page-title, .page-hero .page-sub');
  sequenceTargets.forEach((el, index) => {
    el.style.setProperty('--entry-delay', `${0.1 + index * 0.08}s`);
    el.classList.add('entry-seq');
  });
})();

// ─── NAV ACTIVE STATE ───
(function () {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    link.classList.toggle('active', href === path);
  });
})();

initHireMeChat();
renderProofThumbs();
