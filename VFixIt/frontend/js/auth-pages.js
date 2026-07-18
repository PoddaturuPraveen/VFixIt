/* ── Login Page ──────────────────────────────── */
function renderLogin(app) {
  if (Auth.isLoggedIn()) { Router.go('/'); return; }
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🔧 <span>VFixIt</span></div>
        <div class="auth-title">Welcome back</div>
        <div class="auth-sub">Sign in to your account</div>
        <div class="alert alert-danger" id="loginErr"></div>
        <form id="loginForm">
          <div class="form-group">
            <label for="loginEmail">Email Address</label>
            <input class="form-control" type="email" id="loginEmail" name="email" placeholder="you@example.com" data-required="Email is required" autocomplete="email"/>
            <div class="field-error" id="loginEmailErr"></div>
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input class="form-control" type="password" id="loginPassword" name="password" placeholder="Your password" data-required="Password is required" autocomplete="current-password"/>
            <div class="field-error" id="loginPasswordErr"></div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:4px">Sign In</button>
        </form>
        <div class="auth-footer">
          Don't have an account? <a data-route="/register">Create one →</a>
        </div>

      </div>
    </div>
  `;

  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    Form.clearErrors(form);
    if (!Form.validate(form)) return;
    const btn = form.querySelector('button[type=submit]');
    Form.setLoading(btn, true);
    const errEl = document.getElementById('loginErr');
    errEl.classList.remove('show');
    try {
      const { token, user } = await API.post('/auth/login', { email: form.email.value, password: form.password.value }, false);
      Store.setAuth(token, user);
      Toast.show(`Welcome back, ${user.name}! 👋`, 'success');
      Navbar.render();
      if (user.role === 'admin') Router.go('/admin');
      else if (user.role === 'provider') Router.go('/provider-dashboard');
      else Router.go('/');
    } catch (err) {
      errEl.textContent = err.message || 'Login failed';
      errEl.classList.add('show');
      Form.setLoading(btn, false, 'Create Account');
    }
  };
}

/* ── Register Page ───────────────────────────── */
function renderRegister(app) {
  if (Auth.isLoggedIn()) { Router.go('/'); return; }
  let selectedRole = 'user';

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card" style="max-width:520px">
        <div class="auth-logo">🔧 <span>VFixIt</span></div>
        <div class="auth-title">Create Account</div>
        <div class="auth-sub">Join VFixIt today</div>

        <div class="role-toggle mb-4">
          <button class="role-btn active" id="roleUser" type="button">👤 I need services</button>
          <button class="role-btn" id="roleProv" type="button">🔧 I'm a professional</button>
        </div>

        <div class="alert alert-danger" id="regErr"></div>
        <form id="regForm">
          <div class="form-group">
            <label>Full Name</label>
            <input class="form-control" id="regName" name="name" placeholder="Your full name" data-required="Name is required"/>
            <div class="field-error" id="regNameErr"></div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="form-control" type="email" id="regEmail" name="email" placeholder="you@example.com" data-required="Email is required"/>
            <div class="field-error" id="regEmailErr"></div>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input class="form-control" id="regPhone" name="phone" placeholder="10-digit mobile number"/>
          </div>
          <div class="form-group">
            <label>City</label>
            <input class="form-control" id="regCity" name="city" placeholder="Your city" data-required="City is required"/>
            <div class="field-error" id="regCityErr"></div>
          </div>

          <!-- Provider-only fields -->
          <div id="providerFields" style="display:none">
            <div class="form-group">
              <label>Service Category</label>
              <select class="form-control" id="regCategory" name="category">
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </select>
            </div>
            <div class="form-group">
              <label>Skills (comma-separated)</label>
              <input class="form-control" id="regSkills" name="skills" placeholder="e.g. Wiring, Solar, CCTV"/>
            </div>
            <div class="form-group">
              <label>Price per hour (₹)</label>
              <input class="form-control" type="number" id="regPrice" name="price" placeholder="e.g. 350"/>
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input class="form-control" type="password" id="regPassword" name="password" placeholder="Min. 6 characters" data-required="Password is required" autocomplete="new-password"/>
            <div class="field-error" id="regPasswordErr"></div>
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input class="form-control" type="password" id="regConfirm" placeholder="Re-enter password" autocomplete="new-password"/>
            <div class="field-error" id="regConfirmErr"></div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Create Account</button>
        </form>
        <div class="auth-footer">Already have an account? <a data-route="/login">Sign in →</a></div>
      </div>
    </div>
  `;

  // Role toggle
  document.getElementById('roleUser').onclick = () => {
    selectedRole = 'user';
    document.getElementById('roleUser').classList.add('active');
    document.getElementById('roleProv').classList.remove('active');
    document.getElementById('providerFields').style.display = 'none';
  };
  document.getElementById('roleProv').onclick = () => {
    selectedRole = 'provider';
    document.getElementById('roleProv').classList.add('active');
    document.getElementById('roleUser').classList.remove('active');
    document.getElementById('providerFields').style.display = 'block';
  };

  document.getElementById('regForm').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    Form.clearErrors(form);
    if (!Form.validate(form)) return;

    // Confirm password
    const pw = document.getElementById('regPassword').value;
    const cf = document.getElementById('regConfirm').value;
    if (pw !== cf) { Form.showError('regConfirm', 'Passwords do not match'); return; }
    if (pw.length < 6) { Form.showError('regPassword', 'Min. 6 characters'); return; }

    const btn = form.querySelector('button[type=submit]');
    Form.setLoading(btn, true);
    const errEl = document.getElementById('regErr');
    errEl.classList.remove('show');

    try {
      const payload = {
        name: form.name.value.trim(), email: form.email.value.trim(),
        password: pw, phone: form.phone.value.trim(),
        city: form.city.value.trim(), role: selectedRole,
      };
      if (selectedRole === 'provider') {
        payload.category = document.getElementById('regCategory').value;
        payload.skills = document.getElementById('regSkills').value;
        payload.price = document.getElementById('regPrice').value;
      }
      const { token, user } = await API.post('/auth/register', payload, false);
      Store.setAuth(token, user);
      Toast.show('Account created! Welcome to VFixIt 🎉', 'success');
      Navbar.render();
      if (user.role === 'provider') Router.go('/provider-dashboard');
      else Router.go('/');
    } catch (err) {
      errEl.textContent = err.message || 'Registration failed';
      errEl.classList.add('show');
      Form.setLoading(btn, false, 'Create Account');
    }
  };
}

/* ── User Dashboard / Profile ────────────────── */
async function renderProfile(app) {
  if (!Auth.requireLogin()) return;
  app.innerHTML = '<div class="loading-state" style="min-height:60vh"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div>';

  try {
    const { user } = await API.get('/auth/me');

    app.innerHTML = `
      <section class="section" style="padding-top:32px">
        <div class="container" style="max-width:700px">
          <h1 style="font-family:var(--font-head);font-size:1.5rem;font-weight:800;margin-bottom:24px">My Profile</h1>

          <div class="card mb-4">
            <div class="card-body">
              <div style="display:flex;gap:16px;align-items:center;margin-bottom:20px">
                <div class="avatar-lg">${initials(user.name)}</div>
                <div>
                  <div style="font-family:var(--font-head);font-size:1.2rem;font-weight:700">${user.name}</div>
                  <div class="text-muted">${user.email}</div>
                  <span class="badge badge-primary mt-1">${user.role}</span>
                </div>
              </div>
              <form id="profileForm">
                <div class="grid-2">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input class="form-control" id="pName" value="${user.name}" data-required="Name required"/>
                    <div class="field-error" id="pNameErr"></div>
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input class="form-control" id="pPhone" value="${user.phone || ''}"/>
                  </div>
                  <div class="form-group">
                    <label>City</label>
                    <input class="form-control" id="pCity" value="${user.city || ''}"/>
                  </div>
                  <div class="form-group">
                    <label>Address</label>
                    <input class="form-control" id="pAddress" value="${user.address || ''}"/>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-header">Change Password</div>
            <div class="card-body">
              <div class="alert alert-danger" id="pwErr"></div>
              <div class="alert alert-success" id="pwOk"></div>
              <div class="form-group">
                <label>Current Password</label>
                <input class="form-control" type="password" id="pwCurrent"/>
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input class="form-control" type="password" id="pwNew"/>
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <input class="form-control" type="password" id="pwConfirm"/>
              </div>
              <button class="btn btn-primary" id="changePwBtn">Update Password</button>
            </div>
          </div>

          <div class="card" style="margin-top:24px; border: 1px solid #fca5a5;">
            <div class="card-header" style="background-color: #fef2f2; color: #dc2626; font-weight: 700;">Danger Zone</div>
            <div class="card-body">
              <p style="color:var(--text-2);margin-bottom:16px">Once you delete your account, there is no going back. All your data, bookings, and reviews will be permanently removed. Please be certain.</p>
              <button class="btn btn-danger" id="deleteAccountBtn">Delete Account</button>
            </div>
          </div>
        </div>
      </section>
    `;

    // Profile update
    document.getElementById('profileForm').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      Form.setLoading(btn, true);
      try {
        const { user: u } = await API.put('/auth/profile', {
          name: document.getElementById('pName').value,
          phone: document.getElementById('pPhone').value,
          city: document.getElementById('pCity').value,
          address: document.getElementById('pAddress').value,
        });
        Store.set('vfixit_user', { ...Auth.user(), name: u.name, city: u.city });
        Navbar.render();
        Toast.show('Profile updated!', 'success');
      } catch (err) { Toast.show(err.message, 'error'); }
      Form.setLoading(btn, false, 'Save Changes');
    };

    // Password change
    document.getElementById('changePwBtn').onclick = async () => {
      const curr = document.getElementById('pwCurrent').value;
      const nw = document.getElementById('pwNew').value;
      const cf = document.getElementById('pwConfirm').value;
      const errEl = document.getElementById('pwErr');
      const okEl = document.getElementById('pwOk');
      errEl.classList.remove('show'); okEl.classList.remove('show');
      if (nw !== cf) { errEl.textContent = 'Passwords do not match'; errEl.classList.add('show'); return; }
      if (nw.length < 6) { errEl.textContent = 'Min. 6 characters'; errEl.classList.add('show'); return; }
      try {
        await API.put('/auth/change-password', { currentPassword: curr, newPassword: nw });
        okEl.textContent = 'Password changed successfully!'; okEl.classList.add('show');
        ['pwCurrent', 'pwNew', 'pwConfirm'].forEach(id => document.getElementById(id).value = '');
      } catch (err) { errEl.textContent = err.message; errEl.classList.add('show'); }
    };

    // Delete Account
    document.getElementById('deleteAccountBtn').onclick = async () => {
      if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
      
      const btn = document.getElementById('deleteAccountBtn');
      Form.setLoading(btn, true, "Deleting...");
      try {
        await API.delete('/auth/profile');
        Toast.show('Account deleted successfully.', 'success');
        Store.clearAuth();
        Navbar.render();
        Router.go('/');
      } catch (err) {
        Toast.show(err.message || 'Failed to delete account.', 'error');
        Form.setLoading(btn, false, 'Delete Account');
      }
    };

  } catch (e) { app.innerHTML = '<div class="empty-state"><p class="text-danger">Failed to load profile</p></div>'; }
}

/* ── My Bookings (user) ──────────────────────── */
async function renderMyBookings(app) {
  if (!Auth.requireLogin('user')) return;

  app.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 style="font-family:var(--font-head);font-size:1.5rem;font-weight:800;margin-bottom:8px">My Bookings</h1>
        <p class="text-muted mb-4">Track your service bookings</p>
        <div id="bookingsList"><div class="loading-state"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div></div>
      </div>
    </section>
  `;

  try {
    const { data: bookings } = await API.get('/bookings/my');
    const container = document.getElementById('bookingsList');
    if (!bookings.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📅</div><h3>No bookings yet</h3><p>Find a professional and book your first service</p><a data-route="/services" class="btn btn-primary mt-3">Browse Services</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Provider</th><th>Category</th><th>Date & Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="bookingsTable"></tbody>
        </table>
      </div>
    `;

    const tbody = document.getElementById('bookingsTable');
    const today = new Date().toLocaleDateString('en-CA');
    
    bookings.forEach(b => {
      const isEarly = b.booking_date > today;
      const disableMsg = isEarly ? 'Cannot mark done before scheduled date' : '';
      const disabledAttr = isEarly ? `disabled title="${disableMsg}"` : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div style="font-weight:600">${b.provider_name}</div><div class="text-muted text-xs">${b.category}</div></td>
        <td><span class="badge badge-gray">${b.category}</span></td>
        <td><div style="font-weight:500">${b.booking_date}</div><div class="text-muted text-xs">${b.time_slot}</div></td>
        <td style="font-weight:700;color:var(--primary)">${formatCurrency(b.total_amount)}</td>
        <td>${statusBadge(b.status)}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${b.status === 'pending' ? `<button class="btn btn-danger btn-sm cancel-btn" data-id="${b.id}">Cancel</button>` : ''}
            ${b.status === 'confirmed' && b.user_work_status === 'pending' ? `
              <button class="btn btn-success btn-sm work-done-btn" data-id="${b.id}" ${disabledAttr}>Work Done</button>
              <button class="btn btn-danger btn-sm work-not-done-btn" data-id="${b.id}" ${disabledAttr}>Not Done</button>
            ` : ''}
            ${b.status === 'confirmed' && b.user_work_status === 'done' ? '<span class="badge badge-success">You marked as Done</span>' : ''}
            ${b.status === 'confirmed' && b.user_work_status === 'not_done' ? '<span class="badge badge-danger">You marked as Not Done</span>' : ''}
            ${b.status === 'completed' && !b.reviewed ? `<button class="btn btn-primary btn-sm review-btn" data-id="${b.id}" data-pid="${b.provider_id}">⭐ Review</button>` : ''}
            ${b.status === 'completed' && b.reviewed ? '<span class="badge badge-success">Reviewed</span>' : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Cancel this booking?')) return;
        try {
          await API.patch(`/bookings/${btn.dataset.id}/status`, { status: 'cancelled' });
          Toast.show('Booking cancelled', 'info');
          renderMyBookings(app);
        } catch (e) { Toast.show(e.message, 'error'); }
      };
    });

    // Review buttons
    document.querySelectorAll('.review-btn').forEach(btn => {
      btn.onclick = () => openReviewModal(btn.dataset.id, btn.dataset.pid, app);
    });

    // Work status buttons
    const updateWorkStatus = async (id, status) => {
      if (!confirm(`Mark work as ${status === 'done' ? 'Done' : 'Not Done'}?`)) return;
      try {
        await API.patch(`/bookings/${id}/user-status`, { status });
        Toast.show('Work status updated', 'success');
        renderMyBookings(app);
      } catch (e) { Toast.show(e.message, 'error'); }
    };

    document.querySelectorAll('.work-done-btn').forEach(btn => {
      btn.onclick = () => updateWorkStatus(btn.dataset.id, 'done');
    });
    document.querySelectorAll('.work-not-done-btn').forEach(btn => {
      btn.onclick = () => updateWorkStatus(btn.dataset.id, 'not_done');
    });

  } catch (e) { document.getElementById('bookingsList').innerHTML = '<p class="text-danger">Failed to load bookings.</p>'; }
}

/* ── Review Modal ────────────────────────────── */
function openReviewModal(bookingId, providerId, app) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  let selectedRating = 0;

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Leave a Review</h3><button class="modal-close" id="closeReview">✕</button></div>
      <div class="modal-body">
        <p class="text-muted mb-3">How was the service? Your honest feedback helps others.</p>
        <div class="form-group">
          <label>Rating</label>
          <div class="star-input" id="starInput">
            <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span>
          </div>
          <div class="field-error show hidden" id="starErr">Please select a rating</div>
        </div>
        <div class="form-group">
          <label>Your Review</label>
          <textarea class="form-control" id="reviewComment" placeholder="Share your experience…" rows="4"></textarea>
        </div>
        <button class="btn btn-primary btn-block" id="submitReview">Submit Review</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('#closeReview').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const stars = overlay.querySelectorAll('#starInput span');
  stars.forEach(s => {
    s.onmouseenter = () => stars.forEach((x, i) => x.classList.toggle('active', i < +s.dataset.v));
    s.onmouseleave = () => stars.forEach((x, i) => x.classList.toggle('active', i < selectedRating));
    s.onclick = () => { selectedRating = +s.dataset.v; stars.forEach((x, i) => x.classList.toggle('active', i < selectedRating)); };
  });

  overlay.querySelector('#submitReview').onclick = async () => {
    const errEl = overlay.querySelector('#starErr');
    if (!selectedRating) { errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    const btn = overlay.querySelector('#submitReview');
    Form.setLoading(btn, true);
    try {
      await API.post('/reviews', { booking_id: +bookingId, rating: selectedRating, comment: document.getElementById('reviewComment').value });
      overlay.remove();
      Toast.show('Review submitted! Thank you 🌟', 'success');
      renderMyBookings(app);
    } catch (e) { Toast.show(e.message, 'error'); Form.setLoading(btn, false, 'Submit Review'); }
  };
}
