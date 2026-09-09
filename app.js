function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector('[onclick="switchTab(\'' + tab + '\')"]').classList.add('active');
}

let currentFilter = 'all';
let searchTerm = '';

function renderStats() {
  const avg = Math.round(OFFERS.reduce((s, o) => s + o.score, 0) / OFFERS.length);
  const urgent = OFFERS.filter(o => o.urgency === 'haute').length;
  const cdis = OFFERS.filter(o => o.contract === 'CDI').length;
  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><div class="val">${OFFERS.length}</div><div class="label">Offres selectionnees</div></div>
    <div class="stat-card"><div class="val">${avg}%</div><div class="label">Match moyen</div></div>
    <div class="stat-card"><div class="val orange">${urgent}</div><div class="label">Urgentes</div></div>
    <div class="stat-card"><div class="val green">${cdis}</div><div class="label">CDI</div></div>
  `;
}

function getFilters() {
  const sectors = [...new Set(OFFERS.map(o => o.sector))];
  return sectors;
}

function renderFilters() {
  const sectors = getFilters();
  let html = '<span>Filtrer :</span>';
  html += `<button class="pill ${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">Toutes (${OFFERS.length})</button>`;
  html += `<button class="pill ${currentFilter === 'urgent' ? 'active' : ''}" onclick="setFilter('urgent')">Urgentes</button>`;
  html += `<button class="pill ${currentFilter === 'cdi' ? 'active' : ''}" onclick="setFilter('cdi')">CDI uniquement</button>`;
  html += `<button class="pill ${currentFilter === 'luxe' ? 'active' : ''}" onclick="setFilter('luxe')">Luxe / Premium</button>`;
  html += `<button class="pill ${currentFilter === 'video' ? 'active' : ''}" onclick="setFilter('video')">Video / Production</button>`;
  html += `<button class="pill ${currentFilter === 'agence' ? 'active' : ''}" onclick="setFilter('agence')">Agence</button>`;
  document.getElementById('filters').innerHTML = html;
}

function setFilter(f) {
  currentFilter = f;
  renderFilters();
  renderOffers();
}

function getFiltered() {
  let list = [...OFFERS];
  if (currentFilter === 'urgent') list = list.filter(o => o.urgency === 'haute');
  else if (currentFilter === 'cdi') list = list.filter(o => o.contract === 'CDI');
  else if (currentFilter === 'luxe') list = list.filter(o => o.sector.toLowerCase().includes('luxe') || o.sector.toLowerCase().includes('premium') || o.sector.toLowerCase().includes('joaillerie') || o.sector.toLowerCase().includes('parfum'));
  else if (currentFilter === 'video') list = list.filter(o => o.tags.some(t => t.toLowerCase().includes('video') || t.toLowerCase().includes('production')));
  else if (currentFilter === 'agence') list = list.filter(o => o.sector.toLowerCase().includes('agence') || o.sector.toLowerCase().includes('conseil'));
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.sector.toLowerCase().includes(q) ||
      o.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return list.sort((a, b) => b.score - a.score);
}

function toggleCard(id) {
  const body = document.getElementById('body-' + id);
  const chev = document.getElementById('chev-' + id);
  if (body.classList.contains('open')) {
    body.classList.remove('open');
    chev.classList.remove('open');
  } else {
    body.classList.add('open');
    chev.classList.add('open');
  }
}

function scoreClass(s) {
  if (s >= 90) return 'score-high';
  if (s >= 80) return 'score-mid';
  return 'score-low';
}

function scoreColor(s) {
  if (s >= 90) return '#22c55e';
  if (s >= 80) return '#818cf8';
  return '#f59e0b';
}

function renderOffers() {
  const list = getFiltered();
  if (list.length === 0) {
    document.getElementById('offers').innerHTML = '<p style="text-align:center;color:var(--text3);padding:48px 0">Aucune offre ne correspond a ces criteres.</p>';
    return;
  }
  let html = '';
  list.forEach(o => {
    const contractClass = o.contract === 'CDI' ? 'cdi' : 'cdd';
    const urgentTag = o.urgency === 'haute' ? '<span class="tag urgent">Urgent</span>' : '';
    html += `
    <div class="offer-card">
      <div class="offer-head" onclick="toggleCard(${o.id})">
        <div class="left">
          <div class="company">${o.company}</div>
          <h3>${o.title}</h3>
          <div class="meta">
            <span class="tag ${contractClass}">${o.contract}</span>
            <span class="tag">${o.location}</span>
            ${o.salary !== 'NC' ? `<span class="tag">${o.salary} EUR</span>` : ''}
            ${urgentTag}
          </div>
        </div>
        <div class="score-box">
          <div class="score-circle ${scoreClass(o.score)}">${o.score}%</div>
          <div class="lbl">Match</div>
        </div>
        <svg class="chevron" id="chev-${o.id}" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
      </div>
      <div class="offer-body" id="body-${o.id}">
        <div class="divider"></div>
        <div class="offer-detail">
          <div class="detail-section">
            <h4>Pourquoi ca matche avec Marie</h4>
            <ul class="match-list">
              ${o.match.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
          <div class="detail-section">
            <h4>Informations</h4>
            <div class="info-grid">
              <div class="info-item"><div class="k">Contrat</div><div class="v">${o.contract}</div></div>
              <div class="info-item"><div class="k">Lieu</div><div class="v">${o.location}</div></div>
              <div class="info-item"><div class="k">Salaire</div><div class="v">${o.salary === 'NC' ? 'Non communique' : o.salary + ' EUR'}</div></div>
              <div class="info-item"><div class="k">Experience</div><div class="v">${o.experience}</div></div>
              <div class="info-item"><div class="k">Secteur</div><div class="v">${o.sector}</div></div>
              <div class="info-item"><div class="k">Urgence</div><div class="v">${o.urgency === 'haute' ? 'Haute' : 'Moyenne'}</div></div>
            </div>
            <div class="score-bar"><div class="score-bar-fill" style="width:${o.score}%;background:${scoreColor(o.score)}"></div></div>
            <div class="tags-row">
              ${o.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <a href="${o.url}" target="_blank" rel="noopener" class="btn-apply">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"/><path d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"/></svg>
              Voir l'annonce et postuler
            </a>
          </div>
        </div>
      </div>
    </div>`;
  });
  document.getElementById('offers').innerHTML = html;
}

document.getElementById('search').addEventListener('input', function(e) {
  searchTerm = e.target.value;
  renderOffers();
});

renderStats();
renderFilters();
renderOffers();
