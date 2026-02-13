
// Helper to check admin status
window.checkAndUpdateAdminStatus = async () => {
    try {
        window.isAdminLoggedIn = false;

        if (!window.supabaseManager || !window.supabaseManager.isConnectionReady()) {
            document.body.classList.remove('is-admin');
            return;
        }

        const client = window.supabaseManager.getClient();
        const { data: { session }, error } = await client.auth.getSession();

        if (!error && session) {
            window.isAdminLoggedIn = true;
            document.body.classList.add('is-admin');
            console.log('👤 Admin logged in:', session.user.email);

            // Render admin panel if needed
            if (typeof window.renderAdmin === 'function') {
                // window.renderAdmin(); // Let main render loop handle it
            }
        } else {
            document.body.classList.remove('is-admin');
        }

        // Update UI elements that depend on admin status
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = window.isAdminLoggedIn ? 'block' : 'none';
        });

    } catch (e) {
        console.warn('Check admin status failed:', e);
        window.isAdminLoggedIn = false;
        document.body.classList.remove('is-admin');
    }
};
