// 🔔 FONCTION DE NOTIFICATION GLOBALE
function showNotification(message, type = 'info') {
    // Retirer les anciennes notifications
    const oldNotifications = document.querySelectorAll('.notification-toast');
    oldNotifications.forEach(notif => notif.remove());
    
    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff9d' : type === 'error' ? '#ff4444' : '#00e0ff'};
        color: #0a0e27;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Retirer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Rendre globale pour onclick
window.showNotification = showNotification;

// 📊 FONCTION DE CHARGEMENT
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<p class="empty-state">⏳ Chargement...</p>';
    }
}

// Ajouter l'animation CSS si elle n'existe pas
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard organisateur chargé');

    if (!requireAuth()) return;
    
    const user = getCurrentUser();

    if (user.role_id !== 3 && user.role_id !== 4) {
        alert('Cette page est réservée aux organisateurs');
        window.location.href = '../index.html';
        return;
    }

    displayUserInfo(user);

    loadMyCreatedEvents(user.id);

    setupTabs();

    setupLogoutButton();

    setupEventCreationForm(user);
});

function displayUserInfo(user) {
    const pseudoElements = document.querySelectorAll('.user-pseudo, #userPseudo');
    pseudoElements.forEach(el => {
        if (el) el.textContent = user.pseudo;
    });
    
    const emailElements = document.querySelectorAll('.user-email, #userEmail');
    emailElements.forEach(el => {
        if (el) el.textContent = user.email;
    });
}

async function loadMyCreatedEvents(userId) {
    try {
        showLoading('myEventsContainer');
        
        const url = `${API_CONFIG.BASE_URL}/get_events.php?organizer_id=${userId}&show_all=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Mes événements créés:', result);
        
        if (result.success && result.data && result.data.events) {
            displayMyCreatedEvents(result.data.events);
        } else {
            displayNoEvents();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement', 'error');
        displayNoEvents();
    }
}

function displayMyCreatedEvents(events) {
    const container = document.getElementById('myEventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        displayNoEvents();
        return;
    }

    const pending = events.filter(e => e.status === 'pending');
    const validated = events.filter(e => e.status === 'validated');
    const rejected = events.filter(e => e.status === 'rejected');
    
    container.innerHTML = `
        <div class="stats-row">
            <div class="stat-card">
                <span class="stat-label">Total</span>
                <span class="stat-value">${events.length}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Validés</span>
                <span class="stat-value text-success">${validated.length}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">En attente</span>
                <span class="stat-value text-warning">${pending.length}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Rejetés</span>
                <span class="stat-value text-danger">${rejected.length}</span>
            </div>
        </div>
        <div class="events-grid">
            ${events.map(event => createOrganizerEventCard(event)).join('')}
        </div>
    `;
}

function createOrganizerEventCard(event) {
    const statusBadges = {
        'validated': '<span class="badge badge-success">✓ Validé</span>',
        'pending': '<span class="badge badge-warning">⏳ En attente</span>',
        'rejected': '<span class="badge badge-danger">✗ Rejeté</span>',
        'ongoing': '<span class="badge badge-info">▶ En cours</span>',
        'finished': '<span class="badge badge-secondary">✓ Terminé</span>'
    };
    
    return `
        <div class="event-card">
            <div class="event-header">
                ${statusBadges[event.status] || '<span class="badge">Inconnu</span>'}
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-description">${escapeHtml(event.description).substring(0, 100)}...</p>
                <p class="event-players">
                    <span class="icon">👥</span> ${event.current_players || 0}/${event.max_players} inscrits
                </p>
                <p class="event-visibility">
                    ${event.is_visible === '1' ? '👁️ Public' : '🚫 Caché'}
                </p>
            </div>
            <div class="event-actions">
                <button class="btn-secondary btn-sm" onclick="viewParticipants(${event.id})">
                    Participants
                </button>
                ${event.status === 'validated' && event.can_start === '1' ? `
                    <button class="btn-success btn-sm" onclick="startEvent(${event.id})">
                        🚀 Démarrer
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function viewParticipants(eventId) {
    try {
        const url = `${API_CONFIG.BASE_URL}/get_participants.php?event_id=${eventId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Participants:', result);
        
        if (result.success && result.data) {
            showParticipantsModal(result.data);
        } else {
            showNotification('Aucun participant trouvé', 'info');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des participants', 'error');
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.viewParticipants = viewParticipants;

function showParticipantsModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove(); document.body.style.overflow='';">&times;</span>
            <h2>📋 Participants</h2>
            <div class="participants-list">
                <h3>✅ Acceptés (${data.accepted_count || 0})</h3>
                ${data.accepted && data.accepted.length > 0 ? data.accepted.map(p => `
                    <div class="participant-item">
                        <span><strong>${escapeHtml(p.pseudo)}</strong></span>
                        <span>${escapeHtml(p.email)}</span>
                    </div>
                `).join('') : '<p>Aucun participant accepté</p>'}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Fermer au clic en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

async function startEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir démarrer cet événement ?')) {
        return;
    }
    
    showNotification('Fonctionnalité de démarrage en développement', 'info');

}
// ✅ RENDRE GLOBALE pour onclick
window.startEvent = startEvent;

function setupEventCreationForm(user) {
    const form = document.getElementById('createEventForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Création en cours...';
            
            const formData = {
                user_id: user.id,
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                max_players: parseInt(document.getElementById('eventMaxPlayers').value),
                start_date: document.getElementById('eventDate').value,
                end_date: document.getElementById('eventEndDate').value
            };
            
            console.log('📤 Envoi de l\'événement:', formData);
            
            try {
                const result = await apiRequest('CREATE_EVENT', 'POST', formData);
                
                console.log('📥 Réponse:', result);
                
                if (result.success) {
                    showNotification('✅ Événement créé ! En attente de validation par un administrateur.', 'success');
                    form.reset();
                    
                    // Attendre 1s puis recharger les événements
                    setTimeout(() => {
                        loadMyCreatedEvents(user.id);
                    }, 1000);
                } else {
                    showNotification(result.message || 'Erreur lors de la création', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur de connexion au serveur', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Créer l\'événement';
            }
        });
    }
}

// ✅ NOUVELLE FONCTION AJOUTÉE - Configuration des onglets avec addEventListener
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

function displayNoEvents() {
    const container = document.getElementById('myEventsContainer');
    if (container) {
        container.innerHTML = `
            <div class="no-events">
                <p>Vous n'avez créé aucun événement</p>
                <p>Utilisez le formulaire ci-dessous pour créer votre premier événement !</p>
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

console.log('📜 Dashboard organisateur initialisé');
