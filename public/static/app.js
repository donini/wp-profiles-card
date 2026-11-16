const $ = (selector) => document.querySelector(selector);
const form = $('#creator');
const formats = ['url', 'markdown', 'json'];
let currentFormat = 'url';
let output = {};
let previewObjectUrl;
const say = (message, error = false) => { $('#status').textContent = message; $('#status').classList.toggle('error', error); };
function setFormat(format, focus = false) {
  currentFormat = format;
  document.querySelectorAll('[data-format]').forEach(button => {
    const selected = button.dataset.format === format;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  $('#share-panel').setAttribute('aria-labelledby', `tab-${format}`);
  $('#share-output').value = output[format] || '';
  $('#copy').textContent = `Copy ${format === 'url' ? 'image URL' : format === 'json' ? 'JSON' : 'Markdown'}`;
}
if (form) {
  for (const input of form.querySelectorAll('input[type="color"]')) input.addEventListener('input', () => {
    document.querySelector(`[data-color="${input.name}"]`).textContent = input.value.toUpperCase();
  });
  // Restore shareable studio settings without silently making network requests.
  const existing = new URLSearchParams(location.search);
  for (const input of form.elements) {
    if (!input.name || !existing.has(input.name)) continue;
    if (input.type === 'checkbox') input.checked = existing.get(input.name) === 'true';
    else if (input.type === 'color' && /^[a-f\d]{6}$/i.test(existing.get(input.name))) {
      input.value = `#${existing.get(input.name)}`;
      input.dispatchEvent(new Event('input'));
    } else if (input.name === 'username') input.value = existing.get('username');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const username = form.elements.username.value.trim().toLowerCase();
    form.elements.username.value = username;
    const params = new URLSearchParams({ username });
    for (const input of form.querySelectorAll('input[type="color"]')) params.set(input.name, input.value.slice(1));
    for (const name of ['header', 'avatar', 'badges', 'link']) params.set(name, String(form.elements[name].checked));
    const cardUrl = new URL(`/card?${params}`, location.origin);
    // Refresh is a one-time action, never part of copied embed links.
    const requestUrl = new URL(cardUrl);
    const jsonUrl = new URL(`/json?${new URLSearchParams({ username })}`, location.origin);
    if (form.elements.refresh.checked) { requestUrl.searchParams.set('refresh', 'true'); jsonUrl.searchParams.set('refresh', 'true'); }
    $('#generate').disabled = true;
    $('#card-stage').setAttribute('aria-busy', 'true');
    $('#share').hidden = true;
    $('#card-preview').hidden = true;
    $('#empty-preview').hidden = false;
    say('Gathering your WordPress.org contributions…');
    try {
      // Fetch the image first; the JSON request then reuses the same profile snapshot.
      const response = await fetch(requestUrl, { cache: 'no-store' });
      if (!response.ok) {
        const messages = { 400: 'Check your username and card settings.', 404: 'That WordPress.org profile was not found.', 502: 'WordPress.org is unavailable or its profile format has changed. Please try again later.' };
        throw new Error(messages[response.status] || 'Your card could not be created. Please try again.');
      }
      const blob = await response.blob();
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = URL.createObjectURL(blob);
      const image = $('#card-preview');
      image.src = previewObjectUrl;
      await image.decode();
      image.hidden = false;
      $('#empty-preview').hidden = true;
      const demo = response.headers.get('X-CardPress-Mode') === 'demo';
      const stale = response.headers.get('X-CardPress-Cache') === 'stale';
      $('#mode-label').textContent = demo ? 'DEMO · SAMPLE DATA' : 'SVG PROFILE CARD';
      image.alt = demo ? 'Sample WordPress card for demo mode; not live profile data' : `WordPress.org profile card for ${username}`;
      const target = `https://profiles.wordpress.org/${encodeURIComponent(username)}/`;
      output = { url: cardUrl.href, markdown: `[![${username}'s WordPress Activity](${cardUrl.href})](${target})`, json: 'Loading profile data…' };
      $('#download').href = previewObjectUrl;
      $('#download').download = `cardpress-${username}.svg`;
      $('#share').hidden = false;
      setFormat(currentFormat);
      history.replaceState(null, '', `${location.pathname}?${params}#studio`);
      form.elements.refresh.checked = false;
      say(demo ? 'Demo mode: this is sample data, not a live WordPress.org profile.' : stale ? 'Showing your saved profile while WordPress.org is unavailable.' : 'Your card is ready. Copy a link or download the SVG.');
      const profileResponse = await fetch(jsonUrl, { cache: 'no-store' });
      if (!profileResponse.ok) throw new Error('The card is ready, but profile JSON is temporarily unavailable.');
      output.json = JSON.stringify(await profileResponse.json(), null, 2);
      if (currentFormat === 'json') setFormat('json');
    } catch (error) {
      if ($('#share').hidden) { $('#card-preview').hidden = true; $('#empty-preview').hidden = false; }
      output.json = 'Profile JSON is temporarily unavailable.';
      if (!$('#share').hidden && currentFormat === 'json') setFormat('json');
      say(error instanceof Error ? error.message : 'Something went wrong. Please try again.', true);
    } finally { $('#generate').disabled = false; $('#card-stage').removeAttribute('aria-busy'); }
  });
  document.querySelectorAll('[data-format]').forEach(button => {
    button.addEventListener('click', () => setFormat(button.dataset.format));
    button.addEventListener('keydown', event => {
      let index = formats.indexOf(currentFormat);
      if (event.key === 'ArrowRight') index = (index + 1) % formats.length;
      else if (event.key === 'ArrowLeft') index = (index + formats.length - 1) % formats.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = formats.length - 1;
      else return;
      event.preventDefault(); setFormat(formats[index], true);
    });
  });
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#share-output').value); $('#copy').textContent = 'Copied ✓'; }
    catch { $('#share-output').focus(); $('#share-output').select(); $('#copy').textContent = 'Select and copy the text above'; }
  });
  fetch('/health').then(response => response.json()).then(data => {
    if (data.mode === 'demo') { $('#mode-label').textContent = 'DEMO · SAMPLE DATA'; say('Demo mode: create a card with sample data. No external requests.'); }
  }).catch(() => say('Could not connect to CardPress. Check that the local server is running.', true));
}

for (const code of document.querySelectorAll('[data-example]')) {
  const url = `${location.origin}/card?username=rodrigodonini`;
  code.textContent = code.dataset.example === 'markdown' ? `[![WordPress Activity](${url})](https://profiles.wordpress.org/rodrigodonini/)` : code.dataset.example === 'json' ? `${location.origin}/json?username=rodrigodonini` : url;
}
if ($('#users-grid')) {
  let page = 1;
  async function loadUsers() {
    const status = $('#users-status');
    status.textContent = 'Loading profiles…';
    $('#previous').disabled = $('#next').disabled = true;
    try {
      const response = await fetch(`/api/users?page=${page}`);
      if (!response.ok) throw new Error('Could not load the community list. Please reload to try again.');
      const data = await response.json();
      $('#users-grid').replaceChildren();
      for (const user of data.users) {
        const article = document.createElement('article'); article.className = 'user-card';
        const name = document.createElement('h2'); name.textContent = user.name;
        const meta = document.createElement('p'); meta.textContent = `@${user.username} · First card ${new Date(user.firstSeen * 1000).toLocaleDateString()}`;
        const profile = document.createElement('a'); profile.href = `https://profiles.wordpress.org/${encodeURIComponent(user.username)}/`; profile.textContent = 'WordPress ↗'; profile.target = '_blank'; profile.rel = 'noopener noreferrer';
        const card = document.createElement('a'); card.href = `/create?${new URLSearchParams({ username: user.username })}#studio`; card.textContent = 'Create card ↗';
        article.append(name, meta, profile, card); $('#users-grid').append(article);
      }
      status.textContent = data.demo ? 'Demo mode · Sample contributor, not a live community record.' : data.total ? `${data.total} ${data.total === 1 ? 'profile' : 'profiles'} · Page ${page}` : 'No profiles yet. Create the first card for this installation.';
      $('#previous').hidden = page <= 1;
      $('#next').hidden = page * data.pageSize >= data.total;
    } catch (error) { status.textContent = error.message; }
    finally { $('#previous').disabled = $('#next').disabled = false; }
  }
  $('#previous').addEventListener('click', () => { page--; loadUsers(); });
  $('#next').addEventListener('click', () => { page++; loadUsers(); });
  loadUsers();
}
