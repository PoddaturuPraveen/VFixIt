/* ── Provider Dashboard ──────────────────────── */
async function renderProviderDashboard(app) {
  if (!Auth.requireLogin('provider')) return;

  app.innerHTML = '<div class="loading-state" style="min-height:60vh"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div>';

  try {
    const { data } = await API.get('/providers/my/dashboard');
    const { provider, services, bookings, stats } = data;

    app.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar" id="sidebar">
          <div style="font-size:.7rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;padding:8px 14px;margin-bottom:4px">Provider Menu</div>
          <button class="sidebar-item active" data-tab="overview"><span class="icon">📊</span> Overview</button>
          <button class="sidebar-item" data-tab="bookings"><span class="icon">📅</span> Bookings <span class="badge badge-warning" style="margin-left:auto">${stats.pending}</span></button>
          <button class="sidebar-item" data-tab="services"><span class="icon">🛠️</span> My Services</button>
          <button class="sidebar-item" data-tab="profile"><span class="icon">👤</span> My Profile</button>
          <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--border)">
            <button class="sidebar-item" onclick="Auth.logout()"><span class="icon">🚪</span> Logout</button>
          </div>
        </aside>
        <main class="main-content" id="provMainContent"></main>
      </div>
    `;

    const contentEl = document.getElementById('provMainContent');

    function renderTab(tab) {
      document.querySelectorAll('.sidebar-item[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

      if (tab === 'overview') {
        const verified = provider.verified;
        contentEl.innerHTML = `
          <div style="margin-bottom:24px">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div class="avatar-lg">${initials(provider.name || '')}</div>
              <div>
                <div style="font-family:var(--font-head);font-size:1.3rem;font-weight:800">${provider.name || 'Provider'}</div>
                <div class="text-muted">${provider.category} · ${provider.city}</div>
                ${verified
            ? '<span class="badge badge-success mt-1">✓ Verified</span>'
            : '<span class="badge badge-warning mt-1">⏳ Pending Verification</span>'}
              </div>
            </div>
            ${!verified ? `<div class="alert alert-info show mt-3">Your account is pending admin verification. You'll be notified once approved.</div>` : ''}
          </div>

          <div class="grid-4 mb-4">
            ${[
            ['📅', 'Total Bookings', stats.total, 'badge-gray'],
            ['⏳', 'Pending', stats.pending, 'badge-warning'],
            ['✅', 'Completed', stats.completed, 'badge-success'],
            ['💰', 'Earnings', formatCurrency(stats.earnings), 'badge-primary'],
          ].map(([icon, label, val, badge]) => `
              <div class="stat-card">
                <div class="stat-icon" style="background:var(--bg)">${icon}</div>
                <div class="stat-value">${val}</div>
                <div class="stat-label">${label}</div>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <div class="card-header">Recent Bookings</div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  ${(() => {
                    const today = new Date().toLocaleDateString('en-CA');
                    return bookings.slice(0, 8).map(b => {
                      const isEarly = b.booking_date > today;
                      const disableMsg = isEarly ? 'Cannot complete before scheduled date' : 'Wait for user to mark as done';
                      const disabledAttr = (b.user_work_status !== 'done' || isEarly) ? `disabled title="${disableMsg}"` : '';
                      return `
                    <tr>
                      <td><div style="font-weight:600">${b.user_name}</div><div class="text-muted text-xs">${b.user_phone || ''}</div></td>
                      <td>${b.booking_date}</td>
                      <td style="font-size:.82rem">${b.time_slot}</td>
                      <td style="font-weight:700;color:var(--primary)">${formatCurrency(b.total_amount)}</td>
                      <td>
                        ${statusBadge(b.status)}
                        ${b.user_work_status === 'done' ? '<div style="color:var(--success);font-size:.7rem;margin-top:4px">User: Done</div>' : ''}
                        ${b.user_work_status === 'not_done' ? '<div style="color:var(--danger);font-size:.7rem;margin-top:4px">User: Not Done</div>' : ''}
                      </td>
                      <td>
                        ${b.status === 'pending' ? `
                          <div style="display:flex;gap:4px">
                            <button class="btn btn-success btn-sm" onclick="updateBooking(${b.id},'confirmed')">✓</button>
                            <button class="btn btn-danger btn-sm"  onclick="updateBooking(${b.id},'rejected')">✗</button>
                          </div>
                        ` : b.status === 'confirmed' ? `
                          <button class="btn btn-primary btn-sm" onclick="updateBooking(${b.id},'completed')" ${disabledAttr}>Done</button>
                        ` : '—'}
                      </td>
                    </tr>
                  `;
                    }).join('');
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      else if (tab === 'bookings') {
        contentEl.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:700;margin-bottom:20px">All Bookings</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Address</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${(() => {
                  const today = new Date().toLocaleDateString('en-CA');
                  return bookings.map(b => {
                    const isEarly = b.booking_date > today;
                    const disableMsg = isEarly ? 'Cannot complete before scheduled date' : 'Wait for user to mark as done';
                    const disabledAttr = (b.user_work_status !== 'done' || isEarly) ? `disabled title="${disableMsg}"` : '';
                    return `
                  <tr>
                    <td><div style="font-weight:600">${b.user_name}</div><div class="text-muted text-xs">${b.user_phone || ''}</div></td>
                    <td>${b.booking_date}</td>
                    <td style="font-size:.82rem">${b.time_slot}</td>
                    <td style="font-size:.82rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.address}</td>
                    <td style="font-weight:700;color:var(--primary)">${formatCurrency(b.total_amount)}</td>
                    <td>
                      ${statusBadge(b.status)}
                      ${b.user_work_status === 'done' ? '<div style="color:var(--success);font-size:.7rem;margin-top:4px">User: Done</div>' : ''}
                      ${b.user_work_status === 'not_done' ? '<div style="color:var(--danger);font-size:.7rem;margin-top:4px">User: Not Done</div>' : ''}
                    </td>
                    <td>
                      ${b.status === 'pending' ? `
                        <div style="display:flex;gap:4px">
                          <button class="btn btn-success btn-sm" onclick="updateBooking(${b.id},'confirmed')">Accept</button>
                          <button class="btn btn-danger btn-sm"  onclick="updateBooking(${b.id},'rejected')">Reject</button>
                        </div>
                      ` : b.status === 'confirmed' ? `<button class="btn btn-primary btn-sm" onclick="updateBooking(${b.id},'completed')" ${disabledAttr}>Mark Done</button>` : '—'}
                    </td>
                  </tr>
                `;
                  }).join('');
                })()}
              </tbody>
            </table>
          </div>
        `;
      }

      else if (tab === 'services') {
        contentEl.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
            <h2 style="font-family:var(--font-head);font-weight:700">My Services</h2>
            <button class="btn btn-primary" id="addServiceBtn">+ Add Service</button>
          </div>
          <div class="grid-2" id="servicesGrid">
            ${services.map(s => `
              <div class="card">
                <div class="card-body">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <div style="font-weight:700;margin-bottom:4px">${s.title}</div>
                      <span class="badge badge-gray">${s.category}</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteService(${s.id})">✕</button>
                  </div>
                  <div class="text-muted text-sm mt-2">${s.description || 'No description'}</div>
                  <div style="display:flex;justify-content:space-between;margin-top:12px">
                    <span class="text-muted text-sm">${s.duration_hrs}hr</span>
                    <span style="font-weight:700;color:var(--primary)">${formatCurrency(s.price)}</span>
                  </div>
                </div>
              </div>
            `).join('') || '<p class="text-muted">No services added yet.</p>'}
          </div>
        `;

        document.getElementById('addServiceBtn').onclick = () => openAddServiceModal(app);
      }

      else if (tab === 'profile') {
        contentEl.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:700;margin-bottom:20px">Provider Profile</h2>
          <div class="card">
            <div class="card-body">
              <form id="provProfileForm">
                <div class="grid-2">
                  <div class="form-group">
                    <label>Category</label>
                    <select class="form-control" id="ppCat">
                      ${['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Appliance Repair'].map(c => `<option ${c === provider.category ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Price per hour (₹)</label>
                    <input class="form-control" type="number" id="ppPrice" value="${provider.price_per_hour}"/>
                  </div>
                  <div class="form-group">
                    <label>Experience (years)</label>
                    <input class="form-control" type="number" id="ppExp" value="${provider.experience}"/>
                  </div>
                  <div class="form-group">
                    <label>City</label>
                    <input class="form-control" id="ppCity" value="${provider.city}"/>
                  </div>
                </div>
                <div class="form-group">
                  <label>Skills (comma-separated)</label>
                  <input class="form-control" id="ppSkills" value="${provider.skills}"/>
                </div>
                <div class="form-group">
                  <label>Bio</label>
                  <textarea class="form-control" id="ppBio" rows="3">${provider.bio || ''}</textarea>
                </div>
                <div class="form-group" style="display:flex;align-items:center;gap:10px">
                  <input type="checkbox" id="ppAvailable" ${provider.available ? 'checked' : ''}/>
                  <label for="ppAvailable" style="margin:0;cursor:pointer">Available for bookings</label>
                </div>
                <button type="submit" class="btn btn-primary">Save Profile</button>
              </form>
            </div>
          </div>

          <div class="card" style="margin-top:24px; border: 1px solid #fca5a5;">
            <div class="card-header" style="background-color: #fef2f2; color: #dc2626; font-weight: 700;">Danger Zone</div>
            <div class="card-body">
              <p style="color:var(--text-2);margin-bottom:16px">Once you delete your account, there is no going back. All your data, services, bookings, and reviews will be permanently removed. Please be certain.</p>
              <button class="btn btn-danger" id="deleteProvAccountBtn">Delete Account</button>
            </div>
          </div>
        `;

        document.getElementById('provProfileForm').onsubmit = async (e) => {
          e.preventDefault();
          const btn = e.target.querySelector('button');
          Form.setLoading(btn, true);
          try {
            await API.put('/providers/my/profile', {
              category: document.getElementById('ppCat').value,
              price_per_hour: +document.getElementById('ppPrice').value,
              experience: +document.getElementById('ppExp').value,
              city: document.getElementById('ppCity').value,
              skills: document.getElementById('ppSkills').value,
              bio: document.getElementById('ppBio').value,
              available: document.getElementById('ppAvailable').checked,
            });
            Toast.show('Profile updated!', 'success');
          } catch (err) { Toast.show(err.message, 'error'); }
          Form.setLoading(btn, false, 'Save Profile');
        };

        // Delete Account
        document.getElementById('deleteProvAccountBtn').onclick = async () => {
          if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
          
          const btn = document.getElementById('deleteProvAccountBtn');
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
      }
    }

    // Global booking action
    window.updateBooking = async (id, status) => {
      try {
        await API.patch(`/bookings/${id}/status`, { status });
        Toast.show(`Booking ${status}!`, 'success');
        renderProviderDashboard(app);
      } catch (e) { Toast.show(e.message, 'error'); }
    };

    window.deleteService = async (id) => {
      if (!confirm('Remove this service?')) return;
      try {
        await API.delete(`/providers/my/services/${id}`);
        Toast.show('Service removed', 'info');
        renderProviderDashboard(app);
      } catch (e) { Toast.show(e.message, 'error'); }
    };

    document.querySelectorAll('.sidebar-item[data-tab]').forEach(btn => {
      btn.onclick = () => renderTab(btn.dataset.tab);
    });

    renderTab('overview');
  } catch (e) { console.error(e); app.innerHTML = '<div class="empty-state"><p class="text-danger">Failed to load dashboard.</p></div>'; }
}

/* ── Add Service Modal ───────────────────────── */
function openAddServiceModal(app) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header"><h3>Add New Service</h3><button class="modal-close" id="closeAddSvc">✕</button></div>
      <div class="modal-body">
        <form id="addSvcForm">
          <div class="form-group"><label>Title</label><input class="form-control" id="svcTitle" placeholder="e.g. Full House Wiring" data-required="Title required"/><div class="field-error" id="svcTitleErr"></div></div>
          <div class="form-group"><label>Description</label><textarea class="form-control" id="svcDesc" placeholder="Brief description…"></textarea></div>
          <div class="form-group"><label>Category</label>
            <select class="form-control" id="svcCat">
              ${['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Appliance Repair'].map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Price (₹)</label><input class="form-control" type="number" id="svcPrice" placeholder="e.g. 500" data-required="Price required"/><div class="field-error" id="svcPriceErr"></div></div>
            <div class="form-group"><label>Duration (hours)</label><input class="form-control" type="number" id="svcDur" value="2" min="1"/></div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Add Service</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#closeAddSvc').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.querySelector('#addSvcForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!Form.validate(e.target)) return;
    const btn = e.target.querySelector('button');
    Form.setLoading(btn, true);
    try {
      await API.post('/providers/my/services', {
        title: document.getElementById('svcTitle').value,
        description: document.getElementById('svcDesc').value,
        category: document.getElementById('svcCat').value,
        price: +document.getElementById('svcPrice').value,
        duration_hrs: +document.getElementById('svcDur').value,
      });
      overlay.remove();
      Toast.show('Service added!', 'success');
      renderProviderDashboard(app);
    } catch (err) { Toast.show(err.message, 'error'); Form.setLoading(btn, false, 'Add Service'); }
  };
}

/* ── Admin Dashboard ─────────────────────────── */
async function renderAdmin(app) {
  if (!Auth.requireLogin('admin')) return;

  app.innerHTML = '<div class="loading-state" style="min-height:60vh"><div class="spinner spinner-lg" style="color:var(--primary)"></div></div>';

  try {
    const { data } = await API.get('/admin/dashboard');
    const { stats, recentBookings, recentUsers } = data;

    app.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar" id="sidebar">
          <div style="font-size:.7rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;padding:8px 14px;margin-bottom:4px">Admin Panel</div>
          <button class="sidebar-item active" data-tab="overview"><span class="icon">📊</span> Overview</button>
          <button class="sidebar-item" data-tab="providers"><span class="icon">🔧</span> Providers <span class="badge badge-warning" style="margin-left:auto">${stats.pendingProviders}</span></button>
          <button class="sidebar-item" data-tab="users"><span class="icon">👥</span> Users</button>
          <button class="sidebar-item" data-tab="bookings"><span class="icon">📅</span> Bookings</button>
          <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--border)">
            <button class="sidebar-item" onclick="Auth.logout()"><span class="icon">🚪</span> Logout</button>
          </div>
        </aside>
        <main class="main-content" id="adminContent"></main>
      </div>
    `;

    const content = document.getElementById('adminContent');

    async function renderAdminTab(tab) {
      document.querySelectorAll('.sidebar-item[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

      if (tab === 'overview') {
        content.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:800;margin-bottom:20px">Dashboard Overview</h2>
          <div class="grid-4 mb-4">
            ${[
            ['👥', 'Total Users', stats.totalUsers, '#3b82f6'],
            ['🔧', 'Providers', stats.totalProviders, '#8b5cf6'],
            ['📅', 'Bookings', stats.totalBookings, '#10b981'],
            ['💰', 'Total Revenue', formatCurrency(stats.totalRevenue), '#f59e0b'],
          ].map(([icon, label, val, color]) => `
              <div class="stat-card">
                <div class="stat-icon" style="background:${color}22;color:${color}">${icon}</div>
                <div class="stat-value">${val}</div>
                <div class="stat-label">${label}</div>
              </div>
            `).join('')}
          </div>
          <div class="grid-4 mb-4">
            ${[
            ['✅', 'Verified Pros', stats.verifiedProviders, '#10b981'],
            ['⏳', 'Pending Verify', stats.pendingProviders, '#f59e0b'],
            ['📊', 'Completed Jobs', stats.completedBookings, '#10b981'],
            ['⭐', 'Avg Rating', stats.avgRating + '/5', '#f59e0b'],
          ].map(([icon, label, val, color]) => `
              <div class="stat-card">
                <div class="stat-icon" style="background:${color}22;color:${color}">${icon}</div>
                <div class="stat-value">${val}</div>
                <div class="stat-label">${label}</div>
              </div>
            `).join('')}
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-header">Recent Bookings</div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>User</th><th>Provider</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    ${recentBookings.map(b => `<tr><td>${b.user_name}</td><td>${b.provider_name}</td><td>${b.booking_date}</td><td>${statusBadge(b.status)}</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card">
              <div class="card-header">Recent Users</div>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>City</th></tr></thead>
                  <tbody>
                    ${recentUsers.map(u => `<tr><td><div style="font-weight:600">${u.name}</div><div class="text-muted text-xs">${u.email}</div></td><td><span class="badge badge-gray">${u.role}</span></td><td>${u.city || '—'}</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      else if (tab === 'providers') {
        const { data: providers } = await API.get('/admin/providers');
        content.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:800;margin-bottom:20px">Manage Providers</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>City</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${providers.map(p => `
                  <tr>
                    <td><div style="font-weight:600">${p.name}</div><div class="text-muted text-xs">${p.email}</div></td>
                    <td><span class="badge badge-gray">${p.category}</span></td>
                    <td>${p.city || '—'}</td>
                    <td><span class="stars" style="font-size:.8rem">${'★'.repeat(Math.round(p.rating))}</span> ${p.rating}</td>
                    <td>${p.verified ? '<span class="badge badge-success">Verified</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
                    <td>
                      ${p.verified
            ? `<button class="btn btn-danger btn-sm" onclick="adminVerify(${p.id},false)">Revoke</button>`
            : `<button class="btn btn-success btn-sm" onclick="adminVerify(${p.id},true)">Verify</button>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        window.adminVerify = async (id, verified) => {
          try {
            await API.patch(`/admin/providers/${id}/verify`, { verified });
            Toast.show(verified ? 'Provider verified!' : 'Verification revoked', verified ? 'success' : 'info');
            renderAdminTab('providers');
          } catch (e) { Toast.show(e.message, 'error'); }
        };
      }

      else if (tab === 'users') {
        const { data: users } = await API.get('/admin/users');
        content.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:800;margin-bottom:20px">Manage Users</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td style="font-weight:600">${u.name}</td>
                    <td class="text-muted">${u.email}</td>
                    <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'provider' ? 'badge-info' : 'badge-gray'}">${u.role}</span></td>
                    <td>${u.city || '—'}</td>
                    <td class="text-muted text-xs">${formatDate(u.created_at)}</td>
                    <td>
                      ${u.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="adminDeleteUser(${u.id})">Delete</button>` : '—'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        window.adminDeleteUser = async (id) => {
          if (!confirm('Delete this user permanently?')) return;
          try {
            await API.delete(`/admin/users/${id}`);
            Toast.show('User deleted', 'info');
            renderAdminTab('users');
          } catch (e) { Toast.show(e.message, 'error'); }
        };
      }

      else if (tab === 'bookings') {
        const { data: bookings } = await API.get('/admin/bookings');
        content.innerHTML = `
          <h2 style="font-family:var(--font-head);font-weight:800;margin-bottom:20px">All Bookings</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Provider</th><th>Category</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${bookings.map(b => `
                  <tr>
                    <td style="font-weight:600">${b.user_name}</td>
                    <td>${b.provider_name}</td>
                    <td><span class="badge badge-gray">${b.category}</span></td>
                    <td>${b.booking_date}<div class="text-muted text-xs">${b.time_slot}</div></td>
                    <td style="font-weight:700;color:var(--primary)">${formatCurrency(b.total_amount)}</td>
                    <td>${statusBadge(b.status)}</td>
                    <td>
                      ${!['completed', 'cancelled', 'rejected'].includes(b.status) ? `
                        <select class="form-control" style="width:120px;padding:4px 8px;font-size:.8rem" onchange="adminUpdateBooking(${b.id},this.value)">
                          <option value="">Change…</option>
                          ${['confirmed', 'completed', 'cancelled'].map(s => `<option>${s}</option>`).join('')}
                        </select>
                      `: '—'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        window.adminUpdateBooking = async (id, status) => {
          if (!status) return;
          try {
            await API.patch(`/admin/bookings/${id}/status`, { status });
            Toast.show(`Booking marked as ${status}`, 'success');
            renderAdminTab('bookings');
          } catch (e) { Toast.show(e.message, 'error'); }
        };
      }
    }

    document.querySelectorAll('.sidebar-item[data-tab]').forEach(btn => {
      btn.onclick = () => renderAdminTab(btn.dataset.tab);
    });
    renderAdminTab('overview');

  } catch (e) { console.error(e); app.innerHTML = '<div class="empty-state"><p class="text-danger">Failed to load admin dashboard</p></div>'; }
}
