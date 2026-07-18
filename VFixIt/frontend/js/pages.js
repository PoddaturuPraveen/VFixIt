/* ── Home Page ─────────────────────────────── */
function renderHome(app) {
  const categories = [
    { name: 'Electrician', icon: '⚡', desc: 'Wiring, repairs & installations', color: '#fff3ee', border: '#FF6B2B' },
    { name: 'Plumber', icon: '🚿', desc: 'Pipes, leaks & bathroom fittings', color: '#eff6ff', border: '#3b82f6' },
    { name: 'Carpenter', icon: '🪵', desc: 'Furniture, doors & woodwork', color: '#fefce8', border: '#f59e0b' },
    { name: 'Painter', icon: '🖌️', desc: 'Interior & exterior painting', color: '#f0fdf4', border: '#10b981' },
    { name: 'Appliance Repair', icon: '🔌', desc: 'AC, fridge & washing machine', color: '#fdf4ff', border: '#a855f7' },
    { name: 'More Services', icon: '➕', desc: 'Cleaners, CCTV, gardening & more', color: '#f8fafc', border: '#94a3b8' },
  ];

  app.innerHTML = `
    <!-- HERO -->
    <section class="hero" id="heroSection">
      <div class="hero-inner">
        <div class="hero-tag" id="heroTag">🏆 Trusted by 2,000+ happy customers</div>
        <h1 id="heroH1">Find Trusted Home<br><span class="hero-highlight">Service Experts</span><br>Near You</h1>
        <p id="heroP">Verified electricians, plumbers, carpenters & more.<br>Book in minutes — pay your way.</p>
        <div class="search-box" id="heroSearch">
          <select id="heroCategory" class="hero-select">
            <option value="">🔍 All Services</option>
            ${categories.slice(0, -1).map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('')}
          </select>
          <input type="text" id="heroCity" class="hero-input" placeholder="📍 Your city (e.g. Hyderabad)"/>
          <button class="btn btn-primary hero-search-btn" id="heroSearchBtn">Search</button>
        </div>
        <div class="hero-trust" id="heroTrust">
          <span>✅ Verified pros</span>
          <span>⭐ 4.8 avg rating</span>
          <span>🔒 Secure booking</span>
          <span>💬 24/7 support</span>
        </div>
      </div>
    </section>

    <!-- FLOATING STATS BAR -->
    <div class="stats-bar">
      <div class="container">
        <div class="stats-inner">
          ${[
      ['500+', 'Verified Pros'],
      ['4.8★', 'Avg Rating'],
      ['1,200+', 'Jobs Done'],
      ['10+', 'Cities Covered'],
      ['98%', 'Satisfaction'],
    ].map(([val, label]) => `
            <div class="stat-item">
              <div class="stat-val">${val}</div>
              <div class="stat-lbl">${label}</div>
            </div>
          `).join('<div class="stat-divider"></div>')}
        </div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <section class="section" style="padding-top:56px">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">What we offer</div>
            <h2 class="section-title" style="margin-bottom:6px">Popular Services</h2>
            <p class="section-subtitle">Choose from our most-requested home services</p>
          </div>
          <a data-route="/services" class="btn btn-secondary">Browse All →</a>
        </div>
        <div class="cat-grid" id="catGrid"></div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section hiw-section">
      <div class="container">
        <div class="section-label" style="text-align:center;color:rgba(255,255,255,.5)">Simple process</div>
        <h2 class="section-title" style="text-align:center;color:#fff;margin-bottom:8px">How VFixIt Works</h2>
        <p class="section-subtitle" style="text-align:center;color:rgba(255,255,255,.6);margin-bottom:48px">Book a professional in 4 simple steps</p>
        <div class="hiw-steps">
          ${[
      ['🔍', 'Search', 'Pick your service & city to find nearby verified professionals.'],
      ['👀', 'Compare', 'View profiles, ratings, pricing, and customer reviews.'],
      ['📅', 'Book', 'Confirm your slot in 2 quick steps — takes under a minute.'],
      ['⭐', 'Review', 'Rate your experience after the job and help others decide.'],
    ].map(([icon, title, desc], i) => `
            <div class="hiw-step">
              <div class="hiw-num">${i + 1}</div>
              <div class="hiw-icon">${icon}</div>
              <h3>${title}</h3>
              <p>${desc}</p>
            </div>
            ${i < 3 ? '<div class="hiw-arrow">→</div>' : ''}
          `).join('')}
        </div>
        <div style="text-align:center;margin-top:40px">
          <a data-route="/how-it-works" class="btn" style="background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.2)">Learn More About the Process →</a>
        </div>
      </div>
    </section>

    <!-- FEATURED PROVIDERS -->
    <section class="section" style="padding-top:56px">
      <div class="container">
        <div class="section-header">
          <div>
            <div class="section-label">Top rated</div>
            <h2 class="section-title" style="margin-bottom:6px">Featured Professionals</h2>
            <p class="section-subtitle">Handpicked, verified and highly rated</p>
          </div>
          <a data-route="/services" class="btn btn-secondary">View All →</a>
        </div>
        <div class="cat-chip-row" id="catFilterRow"></div>
        <div class="providers-grid" id="featuredGrid">
          <div class="loading-state" style="grid-column:1/-1">
            <div class="spinner spinner-lg" style="color:var(--primary)"></div>
            <p style="color:var(--text-2)">Loading professionals…</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="section testi-section">
      <div class="container">
        <div class="section-label" style="text-align:center">What customers say</div>
        <h2 class="section-title" style="text-align:center;margin-bottom:8px">Real Reviews</h2>
        <p class="section-subtitle" style="text-align:center;margin-bottom:40px">Genuine feedback from verified customers</p>
        <div class="testi-grid">
          ${[
      { name: 'Priya S.', city: 'Hyderabad', rating: 5, text: 'Found an electrician in 10 minutes. The service was impeccable — fast, clean work and very professional attitude.', svc: 'Electrician' },
      { name: 'Rahul M.', city: 'Secunderabad', rating: 5, text: 'The plumber fixed our pipe leak the same day I booked. Transparent pricing and the provider was very courteous.', svc: 'Plumber' },
      { name: 'Anjali K.', city: 'Warangal', rating: 5, text: 'Got my entire apartment painted in 2 days. The team was punctual, neat and the finish quality is outstanding.', svc: 'Painter' },
      { name: 'Vikram T.', city: 'Hyderabad', rating: 4, text: 'AC servicing done quickly. The technician explained everything and gave honest advice. Will definitely use again.', svc: 'Appliance Repair' },
      { name: 'Meena R.', city: 'Hyderabad', rating: 5, text: 'Custom wardrobe built exactly as discussed. The carpenter was talented and finished ahead of schedule!', svc: 'Carpenter' },
      { name: 'Suresh P.', city: 'Secunderabad', rating: 5, text: 'Excellent platform! Booking was smooth, the professional arrived on time and the quality of work was top notch.', svc: 'Electrician' },
    ].map(t => `
            <div class="testi-card">
              <div class="testi-top">
                <div class="testi-avatar">${t.name.split(' ').map(w => w[0]).join('')}</div>
                <div>
                  <div class="testi-name">${t.name}</div>
                  <div class="testi-city">📍 ${t.city}</div>
                </div>
                <span class="badge badge-primary" style="margin-left:auto">${t.svc}</span>
              </div>
              <div class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
              <p class="testi-text">"${t.text}"</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
      <div class="container" style="text-align:center">
        <h2 style="font-family:var(--font-head);font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#fff;margin-bottom:12px">Ready to Get Started?</h2>
        <p style="color:rgba(255,255,255,.75);font-size:1.05rem;margin-bottom:32px">Join thousands of happy customers who trust VFixIt for all their home service needs.</p>
        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
          <a data-route="/services" class="btn btn-lg" style="background:#fff;color:var(--primary);font-weight:700">Find a Professional</a>
          <a data-route="/register" class="btn btn-lg" style="background:transparent;color:#fff;border:2px solid rgba(255,255,255,.5)">Create Free Account</a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    ${renderFooter()}
  `;

  // ── Category grid
  const catGrid = document.getElementById('catGrid');
  categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'cat-card';
    div.style.cssText = `--cat-color:${cat.color};--cat-border:${cat.border}`;
    div.innerHTML = `
      <div class="cat-icon">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-desc">${cat.desc}</div>
      <div class="cat-arrow">→</div>
    `;
    div.onclick = () => {
      if (cat.name === 'More Services') Router.go('/services');
      else Router.go(`/services?category=${encodeURIComponent(cat.name)}`);
    };
    catGrid.appendChild(div);
  });

  // ── Hero search
  document.getElementById('heroSearchBtn').onclick = doHeroSearch;
  document.getElementById('heroCity').addEventListener('keydown', e => { if (e.key === 'Enter') doHeroSearch(); });

  function doHeroSearch() {
    const cat = document.getElementById('heroCategory').value;
    const city = document.getElementById('heroCity').value.trim();
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    if (city) p.set('city', city);
    Router.go('/services' + (p.toString() ? '?' + p.toString() : ''));
  }

  // ── Featured providers with category filter chips
  const allCats = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Appliance Repair'];
  let activeCat = 'All';
  let allProviders = [];

  const chipRow = document.getElementById('catFilterRow');
  allCats.forEach(c => {
    const chip = document.createElement('button');
    chip.className = 'cat-chip' + (c === 'All' ? ' active' : '');
    chip.textContent = c;
    chip.onclick = () => {
      activeCat = c;
      chipRow.querySelectorAll('.cat-chip').forEach(ch => ch.classList.remove('active'));
      chip.classList.add('active');
      renderFeatured();
    };
    chipRow.appendChild(chip);
  });

  function renderFeatured() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    const filtered = activeCat === 'All' ? allProviders : allProviders.filter(p => p.category === activeCat);
    const show = filtered.slice(0, 6);
    grid.innerHTML = '';
    if (!show.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><p>No providers in this category yet.</p></div>`;
      return;
    }
    show.forEach(p => grid.appendChild(buildProviderCard(p)));
  }

  API.get('/providers?sort=rating', false).then(({ data }) => {
    allProviders = data || [];
    renderFeatured();
  }).catch(() => {
    const g = document.getElementById('featuredGrid');
    if (g) g.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p class="text-danger">Failed to load professionals</p></div>`;
  });

  // ── Scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  setTimeout(() => {
    document.querySelectorAll('.cat-card, .hiw-step, .testi-card, .stat-item').forEach(el => observer.observe(el));
  }, 100);
}

app.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-tag">🏆 500+ Verified Professionals</div>
        <h1>Find Trusted Home <span>Service Experts</span> Near You</h1>
        <p>Verified electricians, plumbers, carpenters & more — book in minutes, pay your way.</p>
        <div class="search-box" id="heroSearch">
          <select id="heroCategory">
            <option value="">All Services</option>
            ${categories.map(c => `<option>${c}</option>`).join('')}
          </select>
          <input type="text" id="heroCity" placeholder="Enter city (e.g. Hyderabad)…" />
          <button class="btn btn-primary" id="heroSearchBtn">🔍 Search</button>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section style="background:var(--surface);padding:28px 32px;border-bottom:1px solid var(--border)">
      <div class="container">
        <div class="grid-4">
          <div class="text-center"><div style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary)">500+</div><div class="text-muted text-sm">Verified Pros</div></div>
          <div class="text-center"><div style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary)">4.8★</div><div class="text-muted text-sm">Avg Rating</div></div>
          <div class="text-center"><div style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary)">1200+</div><div class="text-muted text-sm">Jobs Done</div></div>
          <div class="text-center"><div style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary)">10+</div><div class="text-muted text-sm">Cities</div></div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section">
      <div class="container">
        <div class="section-title">Popular Services</div>
        <div class="section-subtitle">Choose from our most-requested home services</div>
        <div class="grid-3" id="catGrid"></div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section" style="background:var(--secondary)">
      <div class="container text-center">
        <div class="section-title" style="color:#fff">How VFixIt Works</div>
        <div class="section-subtitle" style="color:rgba(255,255,255,.6)">Book a professional in 4 simple steps</div>
        <div class="grid-4" style="margin-top:8px">
          ${[
    ['🔍', 'Search', 'Pick a service and your city'],
    ['👀', 'Compare', 'Browse verified profiles & reviews'],
    ['📅', 'Book', 'Confirm a slot in 2 quick steps'],
    ['⭐', 'Review', 'Rate your experience after service'],
  ].map(([icon, title, desc], i) => `
            <div style="text-align:center;color:#fff">
              <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,107,43,.2);border:2px solid var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 14px">${icon}</div>
              <div style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;font-size:.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 8px">${i + 1}</div>
              <div style="font-weight:700;font-family:var(--font-head);margin-bottom:6px">${title}</div>
              <div style="font-size:.85rem;color:rgba(255,255,255,.6)">${desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED PROVIDERS -->
    <section class="section">
      <div class="container">
        <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:12px">
          <div>
            <div class="section-title" style="margin-bottom:4px">Top Rated Professionals</div>
            <div class="text-muted text-sm">Handpicked, verified, and highly rated</div>
          </div>
          <a data-route="/services" class="btn btn-secondary btn-sm">View All →</a>
        </div>
        <div class="providers-grid" id="featuredGrid">
          <div class="loading-state"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    ${renderFooter()}
  `;

/* ── Services / Search Page ─────────────────── */
async function renderServices(app) {
  const params = new URLSearchParams(location.search);
  const initCat = params.get('category') || '';
  const initCity = params.get('city') || '';
  const categories = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Appliance Repair'];

  app.innerHTML = `
    <div style="background:var(--secondary);padding:40px 32px 24px">
      <div class="container">
        <h1 style="font-family:var(--font-head);font-size:1.8rem;font-weight:800;color:#fff;margin-bottom:6px">Find Professionals</h1>
        <p style="color:rgba(255,255,255,.65)">Browse verified home service experts</p>
      </div>
    </div>

    <section class="section" style="padding-top:28px">
      <div class="container">
        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;align-items:end">
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">Category</label>
                <select class="form-control" id="filterCat">
                  <option value="">All Categories</option>
                  ${categories.map(c => `<option ${c === initCat ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">City</label>
                <input class="form-control" id="filterCity" placeholder="City…" value="${initCity}"/>
              </div>
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">Search</label>
                <input class="form-control" id="filterSearch" placeholder="Name or skills…"/>
              </div>
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">Sort By</label>
                <select class="form-control" id="filterSort">
                  <option value="">Best Match</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">Min Price (₹/hr)</label>
                <input class="form-control" id="filterMinPrice" type="number" placeholder="0" min="0" oninput="if(this.value<0)this.value=0"/>
              </div>
              <div>
                <label class="text-sm font-semibold" style="display:block;margin-bottom:5px">Max Price (₹/hr)</label>
                <input class="form-control" id="filterMaxPrice" type="number" placeholder="Any" min="0" oninput="if(this.value<0)this.value=0"/>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-primary w-full" id="applyFilters">Apply</button>
                <button class="btn btn-secondary" id="clearFilters" title="Clear">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
          <div id="resultCount" class="text-muted text-sm">Loading…</div>
        </div>
        <div class="providers-grid" id="resultsGrid">
          <div class="loading-state" style="grid-column:1/-1"><div class="spinner spinner-lg" style="color:var(--primary)"></div><p>Loading professionals…</p></div>
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;

  async function loadProviders() {
    const p = new URLSearchParams();
    const cat = document.getElementById('filterCat').value;
    const city = document.getElementById('filterCity').value.trim();
    const search = document.getElementById('filterSearch').value.trim();
    const sort = document.getElementById('filterSort').value;
    const minP = document.getElementById('filterMinPrice').value;
    const maxP = document.getElementById('filterMaxPrice').value;

    if (cat) p.set('category', cat);
    if (city) p.set('city', city);
    if (search) p.set('search', search);
    if (sort) p.set('sort', sort);
    if (minP) p.set('min_price', Math.max(0, minP));
    if (maxP) p.set('max_price', Math.max(0, maxP));

    const grid = document.getElementById('resultsGrid');
    const countEl = document.getElementById('resultCount');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-state" style="grid-column:1/-1"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div>';

    try {
      const { data } = await API.get('/providers?' + p.toString(), false);
      countEl.textContent = `${data.length} professional${data.length !== 1 ? 's' : ''} found`;
      grid.innerHTML = '';
      if (!data.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">🔍</div><h3>No providers found</h3><p>Try adjusting your filters</p></div>`;
        return;
      }
      data.forEach(p => grid.appendChild(buildProviderCard(p)));
    } catch (e) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p class="text-danger">Failed to load providers</p></div>`;
    }
  }

  document.getElementById('applyFilters').onclick = loadProviders;
  document.getElementById('clearFilters').onclick = () => {
    ['filterCat', 'filterCity', 'filterSearch', 'filterSort', 'filterMinPrice', 'filterMaxPrice'].forEach(id => document.getElementById(id).value = '');
    loadProviders();
  };
  ['filterCat', 'filterSort'].forEach(id => document.getElementById(id).onchange = loadProviders);

  loadProviders();
}

/* ── Provider Profile Page ──────────────────── */
async function renderProviderProfile(app) {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { Router.go('/services'); return; }

  app.innerHTML = '<div class="loading-state" style="min-height:60vh"><div class="spinner spinner-lg" style="color:var(--primary)"></div><p>Loading profile…</p></div>';

  try {
    const { data: p } = await API.get(`/providers/${id}`, false);

    app.innerHTML = `
      <div style="background:var(--secondary);padding:40px 32px 32px">
        <div class="container">
          <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
            <div class="avatar-lg">${initials(p.name)}</div>
            <div style="flex:1;min-width:200px">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
                <h1 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;color:#fff">${p.name}</h1>
                ${p.verified ? '<span class="badge badge-success">✓ Verified</span>' : ''}
                ${p.available ? '<span class="badge badge-info">Available</span>' : '<span class="badge badge-danger">Unavailable</span>'}
              </div>
              <div style="color:rgba(255,255,255,.7);margin-bottom:10px">${p.category} · ${p.city}</div>
              <div style="display:flex;gap:6px;align-items:center">
                ${stars(p.rating, p.total_reviews)}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--primary)">${formatCurrency(p.price_per_hour)}<span style="font-size:.9rem;color:rgba(255,255,255,.5)">/hr</span></div>
              <button class="btn btn-primary btn-lg mt-2" id="bookNowBtn">📅 Book Now</button>
            </div>
          </div>
        </div>
      </div>

      <section class="section" style="padding-top:32px">
        <div class="container">
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:28px;align-items:start">
            <div>
              <!-- About -->
              <div class="card mb-4">
                <div class="card-header">About</div>
                <div class="card-body">
                  <p style="color:var(--text-2);line-height:1.7">${p.bio || 'No bio provided.'}</p>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
                    ${(p.skills || '').split(',').map(s => `<span class="badge badge-gray">${s.trim()}</span>`).join('')}
                  </div>
                </div>
              </div>

              <!-- Services -->
              ${p.services?.length ? `
              <div class="card mb-4">
                <div class="card-header">Services Offered</div>
                <div class="card-body" style="padding:0">
                  ${p.services.map(s => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border)">
                      <div>
                        <div style="font-weight:600">${s.title}</div>
                        <div class="text-muted text-sm">${s.description || ''} · ${s.duration_hrs}hr</div>
                      </div>
                      <div style="font-weight:700;color:var(--primary)">${formatCurrency(s.price)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>` : ''}

              <!-- Reviews -->
              <div class="card">
                <div class="card-header">Reviews (${p.total_reviews})</div>
                <div class="card-body">
                  ${!p.reviews?.length ? '<p class="text-muted">No reviews yet.</p>' :
        p.reviews.map(r => `
                      <div class="review-card">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                          <div style="font-weight:600">${r.user_name}</div>
                          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                        </div>
                        <p style="color:var(--text-2);font-size:.9rem">${r.comment || 'No comment.'}</p>
                        <div class="text-muted text-xs mt-1">${formatDate(r.created_at)}</div>
                      </div>
                    `).join('')}
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div>
              <div class="card mb-3">
                <div class="card-body">
                  <div style="display:flex;flex-direction:column;gap:12px">
                    ${[
        ['📍', 'Location', p.city],
        ['🎓', 'Experience', `${p.experience} years`],
        ['💰', 'Rate', `${formatCurrency(p.price_per_hour)}/hr`],
        ['⭐', 'Rating', `${p.rating} / 5.0`],
        ['✅', 'Jobs Done', p.total_reviews],
      ].map(([icon, label, val]) => `
                      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--border)">
                        <span class="text-muted text-sm">${icon} ${label}</span>
                        <span style="font-weight:600;font-size:.9rem">${val}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              <button class="btn btn-primary btn-block btn-lg" id="bookSideBtn">📅 Book This Provider</button>
            </div>
          </div>
        </div>
      </section>
      ${renderFooter()}
    `;

    const doBook = () => {
      if (!Auth.isLoggedIn()) { Toast.show('Please login to book', 'info'); Router.go('/login'); return; }
      // Prevent a provider from booking themselves
      if (Auth.role() === 'provider' && Auth.user()?.provider_id === p.id) {
        Toast.show('You cannot book your own services.', 'error'); return;
      }
      openBookingModal(p);
    };
    document.getElementById('bookNowBtn').onclick = doBook;
    document.getElementById('bookSideBtn').onclick = doBook;

    // Hide Book Now buttons entirely if provider is viewing their own profile
    if (Auth.role() === 'provider' && Auth.user()?.provider_id === p.id) {
      document.getElementById('bookNowBtn').style.display = 'none';
      document.getElementById('bookSideBtn').style.display = 'none';
    }

  } catch (e) {
    app.innerHTML = `<div class="empty-state" style="min-height:60vh"><div class="icon">❌</div><h3>Provider not found</h3><a data-route="/services" class="btn btn-primary mt-3">Browse Services</a></div>`;
  }
}

/* ── Provider Card Builder ──────────────────── */
function buildProviderCard(p) {
  const card = document.createElement('div');
  card.className = 'provider-card';
  card.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">
      <div class="p-avatar">${initials(p.name)}</div>
      <div style="flex:1;min-width:0">
        <div class="p-name truncate">${p.name}</div>
        <div class="p-cat">${p.category} · ${p.city}</div>
        ${p.verified ? '<span class="badge badge-success" style="margin-top:4px">✓ Verified</span>' : ''}
      </div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">
      <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span>
      <span style="font-size:.82rem;color:var(--text-2)">${p.rating} (${p.total_reviews})</span>
    </div>
    <div style="font-size:.82rem;color:var(--text-2);margin-bottom:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
      🎓 ${p.experience}yrs exp &nbsp;|&nbsp; ${(p.skills || '').split(',').slice(0, 2).join(', ')}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div class="p-price">${formatCurrency(p.price_per_hour)}<span style="font-size:.75rem;color:var(--text-2)">/hr</span></div>
      ${p.available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-gray">Busy</span>'}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-secondary btn-sm" style="flex:1" data-view="${p.id}">View Profile</button>
      ${!(Auth.role() === 'provider' && Auth.user()?.provider_id === p.id)
        ? `<button class="btn btn-primary btn-sm" style="flex:1" data-book="${p.id}">Book Now</button>`
        : `<button class="btn btn-secondary btn-sm" style="flex:1" disabled>Your Listing</button>`}
    </div>
  `;

  card.querySelector('[data-view]').onclick = (e) => { e.stopPropagation(); Router.go(`/provider?id=${p.id}`); };
  card.querySelector('[data-book]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!Auth.isLoggedIn()) { Toast.show('Please login to book', 'info'); Router.go('/login'); return; }
    if (Auth.role() === 'provider' && Auth.user()?.provider_id === p.id) {
      Toast.show('You cannot book your own services.', 'error'); return;
    }
    openBookingModal(p);
  });
  card.onclick = () => Router.go(`/provider?id=${p.id}`);
  return card;
}

/* ── Booking Modal ──────────────────────────── */
function openBookingModal(provider) {
  const existing = document.getElementById('bookingModalOverlay');
  if (existing) existing.remove();

  const today = new Date().toISOString().split('T')[0];
  const slots = ['8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'];

  const overlay = document.createElement('div');
  overlay.id = 'bookingModalOverlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Book — ${provider.name}</h3>
        <button class="modal-close" id="closeBookModal">✕</button>
      </div>
      <div class="modal-body">
        <!-- Step indicators -->
        <div class="booking-steps mb-4">
          <div class="step-indicator active" id="sInd1"><div class="step-circle">1</div><div class="step-label">Select</div></div>
          <div class="step-indicator" id="sInd2"><div class="step-circle">2</div><div class="step-label">Confirm</div></div>
        </div>

        <!-- Step 1 -->
        <div id="step1">
          <div class="form-group">
            <label>Select Date</label>
            <input type="date" class="form-control" id="bkDate" min="${today}">
            <div class="field-error" id="bkDateErr">Please select a date</div>
          </div>
          <div class="form-group">
            <label>Time Slot</label>
            <select class="form-control" id="bkSlot">
              <option value="">Choose a time slot</option>
              ${slots.map(s => `<option>${s}</option>`).join('')}
            </select>
            <div class="field-error" id="bkSlotErr">Please select a time slot</div>
          </div>
          <div class="form-group">
            <label>Service</label>
            <select class="form-control" id="bkService">
              <option value="">General Service</option>
              ${(provider.services || []).map(s => `<option value="${s.id}">${s.title} — ${formatCurrency(s.price)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Your Address</label>
            <input type="text" class="form-control" id="bkAddress" placeholder="Full address for service visit">
            <div class="field-error" id="bkAddressErr">Please enter your address</div>
          </div>
          <div class="form-group">
            <label>City</label>
            <input type="text" class="form-control" id="bkCity" placeholder="Your city" value="${Auth.user()?.city || ''}">
            <div class="field-error" id="bkCityErr">Please enter your city</div>
          </div>
        </div>

        <!-- Step 2 (hidden) -->
        <div id="step2" class="hidden">
          <div class="alert alert-info show" style="margin-bottom:16px">📋 Please review your booking before confirming.</div>
          <div class="card mb-3">
            <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Provider</span><span class="font-semibold">${provider.name}</span></div>
              <div style="display:flex;justify-content:space-between"><span class="text-muted">Service</span><span class="font-semibold">${provider.category}</span></div>
              <div style="display:flex;justify-content:space-between" id="summDate"><span class="text-muted">Date</span><span class="font-semibold">—</span></div>
              <div style="display:flex;justify-content:space-between" id="summSlot"><span class="text-muted">Time</span><span class="font-semibold">—</span></div>
              <div style="display:flex;justify-content:space-between" id="summAddr"><span class="text-muted">Address</span><span class="font-semibold">—</span></div>
              <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)">
                <span class="font-semibold">Total Estimate</span>
                <span style="font-weight:800;color:var(--primary);font-size:1.05rem" id="summTotal">—</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select class="form-control" id="bkPayment">
              <option value="cash">💵 Cash on Service</option>
              <option value="upi">📱 UPI</option>
              <option value="card">💳 Card</option>
              <option value="netbanking">🏦 Net Banking</option>
            </select>
          </div>
          <div class="form-group">
            <label>Special Notes (optional)</label>
            <textarea class="form-control" id="bkNotes" placeholder="Any specific requirements or instructions…"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="bkBack" style="display:none">← Back</button>
        <button class="btn btn-primary" id="bkNext">Continue →</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  let currentStep = 1;

  overlay.querySelector('#closeBookModal').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const nextBtn = overlay.querySelector('#bkNext');
  const backBtn = overlay.querySelector('#bkBack');

  nextBtn.onclick = async () => {
    if (currentStep === 1) {
      const date = document.getElementById('bkDate');
      const slot = document.getElementById('bkSlot');
      const address = document.getElementById('bkAddress');
      const city = document.getElementById('bkCity');
      let ok = true;

      [[date, 'bkDateErr'], [slot, 'bkSlotErr'], [address, 'bkAddressErr'], [city, 'bkCityErr']].forEach(([el, errId]) => {
        const err = document.getElementById(errId);
        if (!el.value.trim()) { el.classList.add('is-invalid'); err.classList.add('show'); ok = false; }
        else { el.classList.remove('is-invalid'); err.classList.remove('show'); }
      });
      if (!ok) return;

      // Show step 2 summary
      document.getElementById('step1').classList.add('hidden');
      document.getElementById('step2').classList.remove('hidden');
      document.getElementById('sInd1').classList.replace('active', 'done');
      document.getElementById('sInd2').classList.add('active');
      document.getElementById('summDate').querySelector('span:last-child').textContent = date.value;
      document.getElementById('summSlot').querySelector('span:last-child').textContent = slot.value;
      document.getElementById('summAddr').querySelector('span:last-child').textContent = address.value;
      document.getElementById('summTotal').textContent = formatCurrency(provider.price_per_hour) + '/hr';
      backBtn.style.display = '';
      nextBtn.textContent = '✅ Confirm Booking';
      currentStep = 2;
    } else {
      // Submit booking
      Form.setLoading(nextBtn, true);
      try {
        const serviceId = document.getElementById('bkService').value || null;
        await API.post('/bookings', {
          provider_id: provider.id,
          service_id: serviceId ? +serviceId : undefined,
          booking_date: document.getElementById('bkDate').value,
          time_slot: document.getElementById('bkSlot').value,
          address: document.getElementById('bkAddress').value,
          city: document.getElementById('bkCity').value,
          payment_method: document.getElementById('bkPayment').value,
          notes: document.getElementById('bkNotes').value,
          total_amount: provider.price_per_hour,
        });
        overlay.remove();
        Toast.show('Booking submitted! Awaiting provider confirmation.', 'success');
        Router.go('/my-bookings');
      } catch (e) {
        Toast.show(e.message || 'Booking failed', 'error');
        Form.setLoading(nextBtn, false, '✅ Confirm Booking');
      }
    }
  };

  backBtn.onclick = () => {
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('sInd1').classList.replace('done', 'active');
    document.getElementById('sInd2').classList.remove('active');
    backBtn.style.display = 'none';
    nextBtn.textContent = 'Continue →';
    currentStep = 1;
  };
}


function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col footer-brand-col">
              <div class="footer-logo">🔧 VFixIt</div>
              <p>Connecting homes with verified, trusted service professionals across India.</p>
            </div>
            <div class="footer-col">
              <h4>Services</h4>
              <div class="footer-links">
                <a data-route="/services?category=Electrician">⚡ Electricians</a>
                <a data-route="/services?category=Plumber">🚿 Plumbers</a>
                <a data-route="/services?category=Carpenter">🪵 Carpenters</a>
                <a data-route="/services?category=Painter">🖌️ Painters</a>
                <a data-route="/services?category=Appliance Repair">🔌 Appliance Repair</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <div class="footer-links">
                <a data-route="/about">About Us</a>
                <a data-route="/how-it-works">How It Works</a>
                <a data-route="/contact">Contact</a>
                <a data-route="/register">Become a Provider</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <div class="footer-contact-info">
                <div>📧 support@vfixit.in</div>
                <div>📞 +91-9573156020</div>
                <div>📍 Hyderabad, Telangana</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <div class="footer-bottom-inner">
            <span>© 2026 VFixIt </span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/* ── About Page */
function renderAbout(app) {
  app.innerHTML = `
    <div class="page-banner">
      <div class="container" style="text-align:center">
        <div class="section-label" style="color:rgba(255,255,255,.5)">Who we are</div>
        <h1 style="font-family:var(--font-head);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#fff;margin-bottom:12px">About VFixIt</h1>
        <p style="color:rgba(255,255,255,.7);font-size:1.05rem;max-width:560px;margin:0 auto">A student project solving a real-world problem — making home services trustworthy, transparent and easy to book.</p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="about-mission">
          <div class="about-mission-text">
            <div class="section-label">Our Mission</div>
            <h2 style="font-family:var(--font-head);font-size:1.8rem;font-weight:800;margin-bottom:16px">Making Home Services Trustworthy</h2>
            <p style="color:var(--text-2);line-height:1.8;margin-bottom:14px">Finding a reliable plumber, electrician or carpenter has always been a challenge. People rely on word-of-mouth, random listings or unverified aggregators that offer no guarantee of quality, pricing or accountability.</p>
            <p style="color:var(--text-2);line-height:1.8">VFixIt was built to solve this. We verify every professional before they can accept bookings, display transparent pricing, and let customers review only after the job is complete — so every rating you see is earned.</p>
          </div>
          <div class="about-mission-stats">
            ${[['500+', 'Verified Pros'], ['1,200+', 'Jobs Done'], ['4.8★', 'Avg Rating'], ['10+', 'Cities']].map(([v, l]) => `
              <div class="about-stat-card"><div class="about-stat-val">${v}</div><div class="about-stat-lbl">${l}</div></div>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:64px">
          <div class="section-label" style="text-align:center">What drives us</div>
          <h2 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;text-align:center;margin-bottom:36px">Our Core Values</h2>
          <div class="values-grid">
            ${[
      ['🔒', 'Trust & Safety', 'Every provider goes through identity and skill verification before joining.'],
      ['💰', 'Transparent Pricing', 'No hidden charges. Prices are shown upfront on every profile.'],
      ['⭐', 'Quality First', 'Reviews are locked until a booking is marked complete — no fake ratings.'],
      ['🚀', 'Fast & Reliable', 'From search to booking in under 2 minutes. Notifications at every step.'],
      ['🌍', 'Inclusive Coverage', 'Serving not just metros but also Tier-2 and semi-urban areas.'],
      ['🤝', 'Fair to Providers', 'Low commissions and direct payment options so professionals earn fairly.'],
    ].map(([icon, title, desc]) => `
              <div class="value-card">
                <div class="value-icon">${icon}</div>
                <h3>${title}</h3>
                <p>${desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
    </section>
    <section class="cta-banner"><div class="container" style="text-align:center">
      <h2 style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:#fff;margin-bottom:12px">Ready to Experience VFixIt?</h2>
      <p style="color:rgba(255,255,255,.75);margin-bottom:28px">Find a trusted professional near you in minutes.</p>
      <a data-route="/services" class="btn btn-lg" style="background:#fff;color:var(--primary);font-weight:700">Browse Services</a>
    </div></section>
    ${renderFooter()}
  `;
}

/* ── How It Works Page */
function renderHowItWorks(app) {
  app.innerHTML = `
    <div class="page-banner">
      <div class="container" style="text-align:center">
        <div class="section-label" style="color:rgba(255,255,255,.5)">Simple process</div>
        <h1 style="font-family:var(--font-head);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#fff;margin-bottom:12px">How VFixIt Works</h1>
        <p style="color:rgba(255,255,255,.7)">Everything you need to know about booking a service on VFixIt.</p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="section-label">For customers</div>
        <h2 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;margin-bottom:36px">Booking a Service</h2>
        <div class="hiw-timeline">
          ${[
      { step: 1, icon: '🔍', title: 'Search & Filter', desc: 'Enter your service type and city. Use filters to narrow by price, rating, and availability. Only verified professionals appear.' },
      { step: 2, icon: '👤', title: 'View Profiles', desc: 'Click any provider to see their full profile — skills, experience, services offered, pricing, and genuine customer reviews.' },
      { step: 3, icon: '📅', title: 'Select a Slot', desc: 'Pick a date and time slot that works for you. The system prevents double-booking so your slot is guaranteed.' },
      { step: 4, icon: '✅', title: 'Confirm & Pay', desc: 'Review your booking summary and confirm. Choose cash, UPI, card or net banking. Notifications sent to both parties.' },
      { step: 5, icon: '🔔', title: 'Track Status', desc: 'Monitor your booking in real-time — Pending → Confirmed → Completed. Get notified at every stage.' },
      { step: 6, icon: '⭐', title: 'Leave a Review', desc: 'After the service is marked complete, unlock the review form. Your feedback keeps providers accountable.' },
    ].map(s => `
            <div class="hiw-timeline-item">
              <div class="hiw-timeline-left">
                <div class="hiw-timeline-num">${s.step}</div>
                <div class="hiw-timeline-line"></div>
              </div>
              <div class="hiw-timeline-body">
                <div class="hiw-timeline-icon">${s.icon}</div>
                <h3 style="font-family:var(--font-head);font-weight:700;margin-bottom:8px">${s.title}</h3>
                <p style="color:var(--text-2);line-height:1.7">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:64px">
          <div class="section-label">For professionals</div>
          <h2 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;margin-bottom:36px">Joining as a Provider</h2>
          <div class="grid-2" style="gap:20px">
            ${[
      { icon: '📝', title: 'Sign Up', desc: 'Create your provider account and fill in your skills, category, experience, and pricing.' },
      { icon: '✅', title: 'Get Verified', desc: 'Admin reviews your profile. Once verified, you appear in customer searches.' },
      { icon: '📋', title: 'Manage Bookings', desc: 'Accept or reject requests from your dashboard. Mark jobs complete when done.' },
      { icon: '💰', title: 'Track Earnings', desc: 'View completed jobs and total earnings from your provider dashboard.' },
    ].map(s => `
              <div class="card" style="display:flex;gap:16px;padding:20px;align-items:flex-start">
                <div style="width:44px;height:44px;border-radius:10px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${s.icon}</div>
                <div><div style="font-family:var(--font-head);font-weight:700;margin-bottom:6px">${s.title}</div><div style="color:var(--text-2);font-size:.9rem;line-height:1.6">${s.desc}</div></div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:28px;text-align:center"><a data-route="/register" class="btn btn-primary btn-lg">Join as a Provider →</a></div>
        </div>
        <div style="margin-top:64px">
          <div class="section-label">Questions</div>
          <h2 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;margin-bottom:28px">Frequently Asked Questions</h2>
          <div id="faqList"></div>
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
  const faqs = [
    { q: 'Is VFixIt free for customers?', a: 'Yes, browsing and booking is completely free. You only pay for the service you receive.' },
    { q: 'How are providers verified?', a: 'Every provider goes through admin verification before appearing in searches. We check identity, skills, and credentials.' },
    { q: 'Can I cancel a booking?', a: 'Yes, you can cancel a pending booking from My Bookings. For confirmed bookings, contact support.' },
    { q: 'Are reviews genuine?', a: 'Reviews are locked until a booking is marked completed by the provider. Only actual customers can review.' },
    { q: 'What payment methods are accepted?', a: 'Cash on Service, UPI, Credit/Debit Card, and Net Banking. Choose during booking.' },
    { q: 'What if I am not satisfied?', a: 'Raise a dispute via the contact page. Admin reviews all disputes and takes appropriate action.' },
  ];
  const faqList = document.getElementById('faqList');
  faqs.forEach(faq => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `<button class="faq-q" aria-expanded="false"><span>${faq.q}</span><span class="faq-icon">+</span></button><div class="faq-a">${faq.a}</div>`;
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    const icon = item.querySelector('.faq-icon');
    btn.onclick = () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      ans.classList.toggle('open', !open);
      icon.textContent = open ? '+' : '−';
    };
    faqList.appendChild(item);
  });
}

/* ── Contact Page */
function renderContact(app) {
  app.innerHTML = `
    <div class="page-banner">
      <div class="container" style="text-align:center">
        <div class="section-label" style="color:rgba(255,255,255,.5)">Get in touch</div>
        <h1 style="font-family:var(--font-head);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#fff;margin-bottom:12px">Contact Us</h1>
        <p style="color:rgba(255,255,255,.7)">We'd love to hear from you. We'll respond within 24 hours.</p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="contact-layout">
          <div class="contact-info">
            <h2 style="font-family:var(--font-head);font-size:1.4rem;font-weight:800;margin-bottom:24px">Reach Us</h2>
            ${[
      { icon: '📧', label: 'Email', val: 'support@vfixit.in' },
      { icon: '📞', label: 'Phone', val: '+91-90000-00000' },
      { icon: '📍', label: 'Address', val: 'CVR College of Engineering, Mangalpalli, Hyderabad, Telangana 501510' },
      { icon: '🕐', label: 'Hours', val: 'Monday – Saturday: 9:00 AM – 7:00 PM' },
    ].map(c => `
              <div class="contact-info-card">
                <div class="contact-info-icon">${c.icon}</div>
                <div><div style="font-weight:600;font-size:.85rem;color:var(--text-2);margin-bottom:3px">${c.label}</div><div style="font-size:.95rem">${c.val}</div></div>
              </div>
            `).join('')}
            <div style="margin-top:28px;padding:20px;background:var(--primary-light);border-radius:var(--radius);border:1px solid rgba(255,107,43,.2)">
              <div style="font-weight:700;margin-bottom:6px;color:var(--primary)">🎓 Academic Project</div>
              <div style="font-size:.85rem;color:var(--text-2);line-height:1.6">VFixIt is a B.Tech CSE project from CVR College of Engineering. Supervisor: Dr. Venkatesh Sharma</div>
            </div>
          </div>
          <div class="contact-form-wrap">
            <div class="card">
              <div class="card-header">Send a Message</div>
              <div class="card-body">
                <div class="alert alert-success" id="contactSuccess">✅ Message sent! We'll reply within 24 hours.</div>
                <form id="contactForm">
                  <div class="grid-2">
                    <div class="form-group"><label>Your Name</label><input class="form-control" id="cName" placeholder="Full name" data-required="Name required"/><div class="field-error" id="cNameErr"></div></div>
                    <div class="form-group"><label>Email</label><input class="form-control" type="email" id="cEmail" placeholder="you@email.com" data-required="Email required"/><div class="field-error" id="cEmailErr"></div></div>
                  </div>
                  <div class="form-group"><label>Subject</label>
                    <select class="form-control" id="cSubject">
                      <option value="">Select a subject…</option>
                      <option>Booking Issue</option><option>Provider Complaint</option><option>Account Problem</option><option>Payment Issue</option><option>Become a Provider</option><option>General Enquiry</option>
                    </select>
                  </div>
                  <div class="form-group"><label>Message</label><textarea class="form-control" id="cMessage" rows="5" placeholder="Describe your issue or question…" data-required="Message required"></textarea><div class="field-error" id="cMessageErr"></div></div>
                  <button type="submit" class="btn btn-primary btn-block">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
  document.getElementById('contactForm').onsubmit = async (e) => {
    e.preventDefault();
    Form.clearErrors(e.target);
    if (!Form.validate(e.target)) return;
    const btn = e.target.querySelector('button');
    Form.setLoading(btn, true);
    await new Promise(r => setTimeout(r, 700));
    e.target.reset();
    Form.setLoading(btn, false, 'Send Message');
    document.getElementById('contactSuccess').classList.add('show');
    setTimeout(() => document.getElementById('contactSuccess')?.classList.remove('show'), 5000);
  };
}
