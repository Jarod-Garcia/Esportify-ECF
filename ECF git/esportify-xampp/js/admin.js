

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard admin chargé');

    if (!requireAuth()) return;
    
    const user = getCurrentUser();

    if (user.role_id !== 4) {
        alert('Cette page est réservée aux administrateurs');
        window.location.href = '../index.html';
        return;
    }

    displayAdminInfo(user);

    loadPendingEvents();

    loadAllEvents();

    loadStatistics();

    setupTabs();

    setupLogoutButton();
});

function displayAdminInfo(user) {
    const adminPseudoElements = document.querySelectorAll('.admin-pseudo, #adminPseudo');
    adminPseudoElements.forEach(el => {
        if (el) el.textContent = user.pseudo;
    });
    
    const adminEmailElements = document.querySelectorAll('.admin-email, #adminEmail');
    adminEmailElements.forEach(el => {
        if (el) el.textContent = user.email;
    });
}

async function loadPendingEvents() {
    try {
        showLoading('pendingEventsContainer');
        
        const url = `${API_CONFIG.BASE_URL}/get_events.php?status=pending&show_all=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Événements en attente:', result);
        
        if (result.success && result.data && result.data.events) {
            const pendingEvents = result.data.events.filter(e => e.status === 'pending');
            displayPendingEvents(pendingEvents);
        } else {
            displayNoPendingEvents();
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des événements', 'error');
        displayNoPendingEvents();
    }
}

function displayPendingEvents(events) {
    const container = document.getElementById('pendingEventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        displayNoPendingEvents();
        return;
    }
    
    container.innerHTML = `
        <div class="pending-count">
            <span class="badge badge-warning">${events.length} événement(s) en attente</span>
        </div>
        <div class="events-grid">
            ${events.map(event => createPendingEventCard(event)).join('')}
        </div>
    `;
}

function createPendingEventCard(event) {
    return `
        <div class="event-card pending-card">
            <div class="event-header">
                <span class="event-badge badge-pending">En attente</span>
                <span class="event-date">${formatDate(event.created_at)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${escapeHtml(event.organizer_pseudo)}</p>
                <p class="event-description">${escapeHtml(event.description).substring(0, 100)}...</p>
                <p class="event-info">
                    <span>👥 ${event.max_players} joueurs max</span><br>
                    <span>📅 ${formatDate(event.start_date)} - ${formatDate(event.end_date)}</span>
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-success btn-sm" onclick="validateEvent(${event.id})">
                    ✓ Valider
                </button>
                <button class="btn-danger btn-sm" onclick="rejectEvent(${event.id})">
                    ✗ Rejeter
                </button>
                <button class="btn-secondary btn-sm" onclick="viewEventDetailsAdmin(${event.id})">
                    👁️ Détails
                </button>
            </div>
        </div>
    `;
}

async function validateEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir valider cet événement ?')) {
        return;
    }
    
    const user = getCurrentUser();
    
    try {
        const result = await apiRequest('VALIDATE_EVENT', 'POST', {
            admin_id: user.id,
            event_id: eventId,
            action: 'validate'
        });
        
        if (result.success) {
            showNotification('Événement validé avec succès !', 'success');
            loadPendingEvents();
            loadAllEvents();
            loadStatistics();
        } else {
            showNotification(result.message || 'Erreur lors de la validation', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.validateEvent = validateEvent;

async function rejectEvent(eventId) {
    const reason = prompt('Raison du rejet (optionnel):');
    
    if (reason === null) return;
    
    const user = getCurrentUser();
    
    try {
        const result = await apiRequest('VALIDATE_EVENT', 'POST', {
            admin_id: user.id,
            event_id: eventId,
            action: 'reject'
        });
        
        if (result.success) {
            showNotification('Événement rejeté', 'success');
            loadPendingEvents();
            loadStatistics();
        } else {
            showNotification(result.message || 'Erreur lors du rejet', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.rejectEvent = rejectEvent;

async function loadAllEvents() {
    try {
        showLoading('allEventsContainer');
        
        const url = `${API_CONFIG.BASE_URL}/get_events.php?show_all=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Tous les événements:', result);
        
        if (result.success && result.data && result.data.events) {
            displayAllEvents(result.data.events);
        } else {
            displayNoEvents('allEventsContainer');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des événements', 'error');
        displayNoEvents('allEventsContainer');
    }
}

function displayAllEvents(events) {
    const container = document.getElementById('allEventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        displayNoEvents('allEventsContainer');
        return;
    }

    const validated = events.filter(e => e.status === 'validated').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const rejected = events.filter(e => e.status === 'rejected').length;
    
    container.innerHTML = `
        <div class="stats-row">
            <div class="stat-card">
                <span class="stat-label">Total</span>
                <span class="stat-value">${events.length}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Validés</span>
                <span class="stat-value text-success">${validated}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">En attente</span>
                <span class="stat-value text-warning">${pending}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Rejetés</span>
                <span class="stat-value text-danger">${rejected}</span>
            </div>
        </div>
        <div class="events-grid">
            ${events.map(event => createAdminEventCard(event)).join('')}
        </div>
    `;
}

function createAdminEventCard(event) {
    const statusBadges = {
        'validated': '<span class="badge badge-success">Validé</span>',
        'pending': '<span class="badge badge-warning">En attente</span>',
        'rejected': '<span class="badge badge-danger">Rejeté</span>',
        'ongoing': '<span class="badge badge-info">En cours</span>',
        'finished': '<span class="badge badge-secondary">Terminé</span>'
    };
    
    return `
        <div class="event-card">
            <div class="event-header">
                ${statusBadges[event.status] || '<span class="badge">Inconnu</span>'}
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${escapeHtml(event.organizer_pseudo)}</p>
                <p class="event-players">
                    <span class="icon">👥</span> ${event.current_players || 0}/${event.max_players}
                </p>
                <p class="event-visibility">
                    ${event.is_visible === '1' ? '👁️ Visible' : '🚫 Caché'}
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-secondary btn-sm" onclick="viewEventDetailsAdmin(${event.id})">
                    Détails
                </button>
                ${event.status === 'validated' ? `
                    <button class="btn-warning btn-sm" onclick="hideEvent(${event.id})">
                        ${event.is_visible === '1' ? 'Masquer' : 'Afficher'}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function loadStatistics() {
    try {
        const url = `${API_CONFIG.BASE_URL}/get_events.php?show_all=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data && result.data.events) {
            const events = result.data.events;

            updateCounter('totalEvents', events.length);
            updateCounter('pendingEvents', events.filter(e => e.status === 'pending').length);
            updateCounter('validatedEvents', events.filter(e => e.status === 'validated').length);
            updateCounter('activeEvents', events.filter(e => e.status === 'ongoing').length);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateCounter(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function viewEventDetailsAdmin(eventId) {

    window.open(`events.html?eventId=${eventId}`, '_blank');
}
// ✅ RENDRE GLOBALE pour onclick
window.viewEventDetailsAdmin = viewEventDetailsAdmin;

async function hideEvent(eventId) {
    showNotification('Fonctionnalité en cours de développement', 'info');

}
// ✅ RENDRE GLOBALE pour onclick
window.hideEvent = hideEvent;

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.dashboard-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ✅ NOUVELLE FONCTION AJOUTÉE - Permet de changer d'onglet via onclick
function switchTab(tabName) {
    console.log('🔄 Changement d\'onglet vers:', tabName);
    
    // Récupérer tous les boutons d'onglets et sections
    const tabButtons = document.querySelectorAll('.tab-btn, .action-card');
    const sections = document.querySelectorAll('.dashboard-section');
    
    // Désactiver tous les onglets et sections
    tabButtons.forEach(btn => btn.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    // Trouver et activer le bouton correspondant
    const targetButton = document.querySelector(`[data-section="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Activer la section correspondante
    const targetSection = document.getElementById(tabName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroller vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ Onglet activé:', tabName);
    } else {
        console.error('❌ Section introuvable:', tabName);
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.switchTab = switchTab;

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>
        `;
    }
}

function displayNoPendingEvents() {
    const container = document.getElementById('pendingEventsContainer');
    if (container) {
        container.innerHTML = `
            <div class="no-events success-message">
                <p>✅ Aucun événement en attente de validation</p>
            </div>
        `;
    }
}

function displayNoEvents(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="no-events">
                <p>Aucun événement trouvé</p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00ff9d' : type === 'error' ? '#ff4444' : '#00e0ff'};
        color: #0a0a0a;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

console.log('📜 Dashboard admin initialisé');
