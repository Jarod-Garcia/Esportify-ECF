

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard joueur chargé');

    if (!requireAuth()) return;
    
    const user = getCurrentUser();

    displayUserInfo(user);

    loadMyEvents(user.id);

    loadAvailableEvents();

    setupTabs();

    setupProfileForm(user);

    setupLogoutButton();
});

function displayUserInfo(user) {

    const userPseudoElements = document.querySelectorAll('.user-pseudo, #userPseudo');
    userPseudoElements.forEach(el => {
        if (el) el.textContent = user.pseudo;
    });

    const userEmailElements = document.querySelectorAll('.user-email, #userEmail');
    userEmailElements.forEach(el => {
        if (el) el.textContent = user.email;
    });

    const userRoleElements = document.querySelectorAll('.user-role, #userRole');
    userRoleElements.forEach(el => {
        if (el) el.textContent = user.role_name || 'Joueur';
    });
}

async function loadMyEvents(userId) {
    try {
        showLoading('myEventsContainer');
        
        const url = `${API_CONFIG.BASE_URL}/get_my_events.php?user_id=${userId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Mes événements:', result);
        
        if (result.success && result.data) {
            displayMyEvents(result.data);
        } else {
            displayNoEvents('myEventsContainer');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement de vos événements', 'error');
        displayNoEvents('myEventsContainer');
    }
}

function displayMyEvents(data) {
    const container = document.getElementById('myEventsContainer');
    if (!container) return;
    
    const events = data.all_events || [];
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <p>Vous n'êtes inscrit à aucun événement</p>
                <button class="btn-primary" onclick="showTab('discover')">Découvrir les événements</button>
            </div>
        `;
        return;
    }

    const upcoming = events.filter(e => new Date(e.start_date) > new Date());
    const ongoing = events.filter(e => e.status === 'ongoing');
    const finished = events.filter(e => e.status === 'finished');
    
    container.innerHTML = `
        <div class="events-tabs">
            <button class="sub-tab-btn active" data-filter="all">Tous (${events.length})</button>
            <button class="sub-tab-btn" data-filter="upcoming">À venir (${upcoming.length})</button>
            <button class="sub-tab-btn" data-filter="ongoing">En cours (${ongoing.length})</button>
            <button class="sub-tab-btn" data-filter="finished">Terminés (${finished.length})</button>
        </div>
        <div class="events-grid" id="myEventsGrid">
            ${events.map(event => createMyEventCard(event)).join('')}
        </div>
    `;

    setupEventFilters(events);
}

function createMyEventCard(event) {
    const startDate = new Date(event.start_date);
    const now = new Date();
    const status = startDate > now ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminé';
    const statusClass = startDate > now ? 'upcoming' : event.status === 'ongoing' ? 'ongoing' : 'finished';
    
    return `
        <div class="event-card" data-status="${statusClass}">
            <div class="event-header">
                <span class="event-badge badge-${statusClass}">${status}</span>
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${escapeHtml(event.organizer_pseudo)}</p>
                <p class="event-players">
                    <span class="icon">👥</span> ${event.current_players}/${event.max_players}
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-secondary btn-sm" onclick="viewEventDetails(${event.id})">Détails</button>
                ${status === 'À venir' ? `
                    <button class="btn-danger btn-sm" onclick="unregisterFromEvent(${event.id})">
                        Se désinscrire
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function unregisterFromEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir vous désinscrire de cet événement ?')) {
        return;
    }
    
    const user = getCurrentUser();
    
    try {
        const result = await apiRequest('UNREGISTER_FROM_EVENT', 'POST', {
            event_id: eventId,
            user_id: user.id
        });
        
        if (result.success) {
            showNotification('Désinscription réussie', 'success');
            loadMyEvents(user.id);
        } else {
            showNotification(result.message || 'Erreur lors de la désinscription', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.unregisterFromEvent = unregisterFromEvent;

async function loadAvailableEvents() {
    try {
        showLoading('availableEventsContainer');
        
        const url = `${API_CONFIG.BASE_URL}/get_events.php`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Événements disponibles:', result);
        
        if (result.success && result.data && result.data.events) {
            displayAvailableEvents(result.data.events);
        } else {
            displayNoEvents('availableEventsContainer');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des événements', 'error');
        displayNoEvents('availableEventsContainer');
    }
}

function displayAvailableEvents(events) {
    const container = document.getElementById('availableEventsContainer');
    if (!container) return;

    const validEvents = events.filter(e => e.status === 'validated' && (e.is_visible === 1 || e.is_visible === '1'));
    
    if (validEvents.length === 0) {
        displayNoEvents('availableEventsContainer');
        return;
    }
    
    container.innerHTML = `
        <div class="events-grid">
            ${validEvents.map(event => createAvailableEventCard(event)).join('')}
        </div>
    `;
}

function createAvailableEventCard(event) {
    const isFull = event.current_players >= event.max_players;
    
    return `
        <div class="event-card">
            <div class="event-header">
                <span class="event-badge badge-upcoming">Disponible</span>
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${escapeHtml(event.organizer_pseudo)}</p>
                <p class="event-players ${isFull ? 'full' : ''}">
                    <span class="icon">👥</span> ${event.current_players}/${event.max_players}
                    ${isFull ? '<span class="full-badge">COMPLET</span>' : ''}
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-secondary btn-sm" onclick="viewEventDetails(${event.id})">Détails</button>
                ${!isFull ? `
                    <button class="btn-primary btn-sm" onclick="registerToEvent(${event.id})">
                        S'inscrire
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function registerToEvent(eventId) {
    const user = getCurrentUser();
    
    try {
        const result = await apiRequest('REGISTER_TO_EVENT', 'POST', {
            event_id: eventId,
            user_id: user.id
        });
        
        if (result.success) {
            showNotification('Inscription réussie !', 'success');
            loadMyEvents(user.id);
            loadAvailableEvents();
        } else {
            showNotification(result.message || 'Erreur lors de l\'inscription', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.registerToEvent = registerToEvent;

async function viewEventDetails(eventId) {

    window.location.href = `events.html?eventId=${eventId}`;
}
// ✅ RENDRE GLOBALE pour onclick
window.viewEventDetails = viewEventDetails;

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

function setupEventFilters(events) {
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            filterMyEvents(events, filter);
        });
    });
}

function filterMyEvents(events, filter) {
    const grid = document.getElementById('myEventsGrid');
    if (!grid) return;
    
    let filteredEvents = events;
    const now = new Date();
    
    if (filter === 'upcoming') {
        filteredEvents = events.filter(e => 
            e.status === 'validated' && new Date(e.start_date) > now
        );
    } else if (filter === 'ongoing') {
        filteredEvents = events.filter(e => e.status === 'ongoing');
    } else if (filter === 'finished') {
        filteredEvents = events.filter(e => e.status === 'finished');
    }
    
    if (filteredEvents.length === 0) {
        grid.innerHTML = '<div class="no-events"><p>Aucun événement dans cette catégorie</p></div>';
    } else {
        grid.innerHTML = filteredEvents.map(event => createMyEventCard(event)).join('');
    }
}

function setupProfileForm(user) {
    const profileForm = document.querySelector('.profile-form');
    
    if (profileForm) {

        const emailInput = profileForm.querySelector('#email');
        const pseudoInput = profileForm.querySelector('#pseudo');
        
        if (emailInput) emailInput.value = user.email;
        if (pseudoInput) pseudoInput.value = user.pseudo;
        
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            showNotification('Mise à jour du profil en cours...', 'info');

            setTimeout(() => {
                showNotification('Profil mis à jour avec succès !', 'success');
            }, 1000);
        });
    }
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

function showTab(tabName) {
    const tabBtn = document.querySelector(`[data-section="${tabName}"]`);
    if (tabBtn) tabBtn.click();
}
// ✅ RENDRE GLOBALE pour onclick
window.showTab = showTab;

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

function displayNoEvents(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="no-events">
                <p>Aucun événement disponible</p>
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

console.log('📜 Dashboard joueur initialisé');
