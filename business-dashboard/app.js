// ========================================
// REPLAI Business Dashboard - Shared JavaScript
// Auth helpers, API wrapper, utilities
// ========================================

// --- AUTHENTICATION ---

const BusinessAuth = {
  // Get stored token
  getToken: () => localStorage.getItem('businessToken'),

  // Get stored business data
  getBusiness: () => {
    const data = localStorage.getItem('businessData');
    return data ? JSON.parse(data) : {};
  },

  // Check if logged in
  isLoggedIn: () => !!localStorage.getItem('businessToken'),

  // Save auth data
  save: (token, business) => {
    localStorage.setItem('businessToken', token);
    localStorage.setItem('businessData', JSON.stringify(business));
  },

  // Logout
  logout: async () => {
    const token = BusinessAuth.getToken();
    if (token) {
      try {
        await API.post('/api/business/auth/logout', { token });
      } catch (err) {
        console.error('Logout API error:', err);
      }
    }
    localStorage.removeItem('businessToken');
    localStorage.removeItem('businessData');
    window.location.href = '/business';
  }
};

// Redirect to login if not authenticated
async function requireAuth() {
  if (!BusinessAuth.isLoggedIn()) {
    window.location.href = '/business';
    return false;
  }

  try {
    const res = await API.get('/api/business/auth/verify');
    if (!res.valid) {
      BusinessAuth.logout();
      return false;
    }
    return true;
  } catch (err) {
    console.error('Auth verification error:', err);
    window.location.href = '/business';
    return false;
  }
}

// --- API WRAPPER ---

const API = {
  // GET request
  async get(url) {
    try {
      const res = await fetch(url, {
        headers: {
          'x-business-token': BusinessAuth.getToken() || ''
        }
      });

      if (res.status === 401) {
        BusinessAuth.logout();
        throw new Error('Unauthorized');
      }

      return await res.json();
    } catch (err) {
      console.error('API GET error:', err);
      throw err;
    }
  },

  // POST request
  async post(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-token': BusinessAuth.getToken() || ''
        },
        body: JSON.stringify(data)
      });

      if (res.status === 401) {
        BusinessAuth.logout();
        throw new Error('Unauthorized');
      }

      return await res.json();
    } catch (err) {
      console.error('API POST error:', err);
      throw err;
    }
  },

  // PATCH request
  async patch(url, data) {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-business-token': BusinessAuth.getToken() || ''
        },
        body: JSON.stringify(data)
      });

      if (res.status === 401) {
        BusinessAuth.logout();
        throw new Error('Unauthorized');
      }

      return await res.json();
    } catch (err) {
      console.error('API PATCH error:', err);
      throw err;
    }
  },

  // DELETE request
  async delete(url) {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-business-token': BusinessAuth.getToken() || ''
        }
      });

      if (res.status === 401) {
        BusinessAuth.logout();
        throw new Error('Unauthorized');
      }

      return await res.json();
    } catch (err) {
      console.error('API DELETE error:', err);
      throw err;
    }
  }
};

// --- TOAST NOTIFICATIONS ---

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  // Set color based on type
  if (type === 'error') {
    toast.style.background = '#e74c3c';
  } else if (type === 'warning') {
    toast.style.background = '#f39c12';
  } else if (type === 'info') {
    toast.style.background = '#3498db';
  } else {
    toast.style.background = '#2ecc71';
  }

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// --- DATE & TIME UTILITIES ---

// Format time "14:30" → "2:30 PM"
function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Format date as "Monday, Sep 28"
function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

// Get today's date as YYYY-MM-DD
function todayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Format timestamp for messages
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(timestamp.split('T')[0]);
}

// --- LOADING STATES ---

// Show loading state on button
function setLoading(element, loading) {
  if (!element) return;

  if (loading) {
    element.dataset.originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    element.style.opacity = '0.6';
  } else {
    element.textContent = element.dataset.originalText || element.textContent;
    element.disabled = false;
    element.style.opacity = '1';
  }
}

// Show loading overlay
function showLoading() {
  let overlay = document.getElementById('loading-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
  }

  overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// --- NAVIGATION HELPERS ---

// Set active nav item
function setActiveNav(pageName) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(pageName)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// --- MODAL HELPERS ---

// Create and show modal
function showModal(title, bodyHTML, buttons = []) {
  // Remove existing modal
  const existing = document.getElementById('dynamic-modal');
  if (existing) {
    existing.remove();
  }

  // Create modal
  const overlay = document.createElement('div');
  overlay.id = 'dynamic-modal';
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <div class="modal-title">${title}</div>
    <button class="modal-close" onclick="closeModal()">×</button>
  `;

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = bodyHTML;

  // Footer (if buttons provided)
  let footer = null;
  if (buttons.length > 0) {
    footer = document.createElement('div');
    footer.className = 'modal-footer';

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = btn.className || 'btn btn-primary';
      button.textContent = btn.text;
      button.onclick = btn.onclick;
      footer.appendChild(button);
    });
  }

  modal.appendChild(header);
  modal.appendChild(body);
  if (footer) modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
}

// Close modal
function closeModal() {
  const modal = document.getElementById('dynamic-modal');
  if (modal) {
    modal.remove();
  }
}

// Confirm dialog
function confirmDialog(message, onConfirm, onCancel = null) {
  showModal(
    'Confirm',
    `<p style="font-size: 15px; color: var(--text);">${message}</p>`,
    [
      {
        text: 'Cancel',
        className: 'btn btn-ghost',
        onclick: () => {
          closeModal();
          if (onCancel) onCancel();
        }
      },
      {
        text: 'Confirm',
        className: 'btn btn-danger',
        onclick: () => {
          closeModal();
          onConfirm();
        }
      }
    ]
  );
}

// --- STATUS HELPERS ---

// Get status badge HTML
function getStatusBadge(status) {
  const badges = {
    'confirmed': '<span class="badge badge-confirmed">Confirmed</span>',
    'completed': '<span class="badge badge-completed">Completed</span>',
    'cancelled': '<span class="badge badge-cancelled">Cancelled</span>',
    'pending': '<span class="badge badge-pending">Pending</span>'
  };
  return badges[status] || badges['pending'];
}

// Get platform emoji
function getPlatformEmoji(platform) {
  const emojis = {
    'instagram': '📷',
    'telegram': '✈️',
    'whatsapp': '💬',
    'business-dashboard': '💼',
    'admin': '⚙️'
  };
  return emojis[platform] || '📱';
}

// --- VALIDATION HELPERS ---

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (simple check for Kyrgyzstan format)
function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9; // Allow various formats
}

// --- DEBOUNCE UTILITY ---

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- ERROR HANDLING ---

function handleError(err, customMessage = 'An error occurred') {
  console.error('Error:', err);

  let message = customMessage;

  if (err.message) {
    message = err.message;
  }

  if (err.error) {
    message = err.error;
  }

  showToast(message, 'error');
}

// --- AUTO-REFRESH HELPER ---

let autoRefreshInterval = null;

function startAutoRefresh(callback, intervalMs = 30000) {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Set new interval
  autoRefreshInterval = setInterval(callback, intervalMs);

  console.log(`[AutoRefresh] Started (${intervalMs / 1000}s interval)`);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('[AutoRefresh] Stopped');
  }
}

// Stop auto-refresh when page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  }
});

// --- EXPORT FOR DEBUGGING ---

// Make functions available in console for debugging
window.REPLAI = {
  auth: BusinessAuth,
  api: API,
  utils: {
    formatTime,
    formatDate,
    formatDateLong,
    todayStr,
    getGreeting,
    formatTimestamp,
    showToast,
    showLoading,
    hideLoading,
    showModal,
    closeModal,
    confirmDialog,
    getStatusBadge,
    getPlatformEmoji
  }
};

console.log('REPLAI Business Dashboard - Ready ✅');
