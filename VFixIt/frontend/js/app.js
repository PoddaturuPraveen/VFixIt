/* ============================================================
   VFixIt – Main App Entry (SPA Router)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  Router.register('/',                    renderHome);
  Router.register('/services',            renderServices);
  Router.register('/provider',            renderProviderProfile);
  Router.register('/login',               renderLogin);
  Router.register('/register',            renderRegister);
  Router.register('/profile',             renderProfile);
  Router.register('/my-bookings',         renderMyBookings);
  Router.register('/provider-dashboard',  renderProviderDashboard);
  Router.register('/admin',               renderAdmin);
  Router.register('/about',               renderAbout);
  Router.register('/how-it-works',        renderHowItWorks);
  Router.register('/contact',             renderContact);
  Router.register('/404', (app) => {
    app.innerHTML = `
      <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px">
        <div style="font-size:5rem;margin-bottom:20px">🔧</div>
        <h1 style="font-family:var(--font-head);font-size:2rem;font-weight:800;color:var(--secondary);margin-bottom:10px">Page Not Found</h1>
        <p style="color:var(--text-2);margin-bottom:28px">The page you're looking for doesn't exist or has been moved.</p>
        <a data-route="/" class="btn btn-primary btn-lg">← Back to Home</a>
      </div>
    `;
  });

  Navbar.render();
  Router.init();
});
