

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page des événements chargée');

    const user = getCurrentUser();
    updateNavigation(user);

    loadEvents();

    setupFilters();
});

function updateNavigation(user) {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
    
    if (user && loginBtn) {
        loginBtn.textContent = 'Mon Espace';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            redirectToDashboard(user.role_id);
        };

        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('logoutBtn')) {
            const logoutLi = document.createElement('li');
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logoutBtn';
            logoutLink.textContent = 'Déconnexion';
            logoutLink.onclick = function(e) {
                e.preventDefault();
                logoutUser();
            };
            logoutLi.appendChild(logoutLink);
            navLinks.appendChild(logoutLi);
        }
    } else if (loginBtn && loginModal) {

        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔓 Ouverture de la modal de connexion');
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && loginModal) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal && loginModal.style.display === 'block') {
            loginModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            if (!email || !password) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
            
            try {
                const result = await apiRequest('LOGIN', 'POST', {
                    email: email,
                    password: password
                });
                
                if (result.success && result.data && result.data.user) {
                    const user = result.data.user;
                    saveCurrentUser(user);
                    showNotification('Connexion réussie ! Redirection...', 'success');
                    
                    setTimeout(function() {
                        redirectToDashboard(user.role_id);
                    }, 1000);
                } else {
                    showNotification(result.message || 'Erreur de connexion', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Se connecter';
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur de connexion au serveur', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    }
}

function redirectToDashboard(roleId) {
    let url = 'dashboard-player-unified.html';
    
    if (roleId === 4) {
        url = 'dashboard-admin.html';
    } else if (roleId === 3) {
        url = 'dashboard-organizer.html';
    }
    
    window.location.href = url;
}

// ✅ NOUVELLE FONCTION AJOUTÉE - Alias pour compatibilité avec les boutons onclick statiques
function showEventDetails(eventId) {
    // Cette fonction est appelée par les boutons onclick dans le HTML statique
    // Elle appelle simplement showEventModal
    showEventModal(eventId);
}
// ✅ RENDRE GLOBALE pour onclick
window.showEventDetails = showEventDetails;

async function loadEvents(filters = {}) {
    try {
        showLoading(true);

        let url = getApiUrl('GET_EVENTS');
        const params = new URLSearchParams();
        
        if (filters.status) {
            params.append('status', filters.status);
        }
        if (filters.organizer_id) {
            params.append('organizer_id', filters.organizer_id);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Événements reçus:', result);
        
        if (result.success && result.data && result.data.events) {
            displayEvents(result.data.events);
        } else {
            displayNoEvents();
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        showNotification('Erreur lors du chargement des événements', 'error');
        showLoading(false);
    }
}

function displayEvents(events) {
    const eventsContainer = document.getElementById('eventsGrid');
    
    if (!eventsContainer) return;
    
    if (events.length === 0) {
        displayNoEvents();
        return;
    }

    const visibleEvents = events.filter(event => 
        event.status === 'validated' && (event.is_visible === 1 || event.is_visible === '1')
    );
    
    if (visibleEvents.length === 0) {
        displayNoEvents();
        return;
    }
    
    eventsContainer.innerHTML = visibleEvents.map(event => createEventCard(event)).join('');

    document.querySelectorAll('.event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            showEventModal(eventId);
        });
    });
}

function createEventCard(event) {
    const startDate = new Date(event.start_date);
    const now = new Date();
    const badgeText = startDate > now ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminé';
    const badgeClass = startDate > now ? 'badge-upcoming' : event.status === 'ongoing' ? 'badge-ongoing' : 'badge-finished';
    
    const currentPlayers = event.current_players || 0;
    const maxPlayers = event.max_players;
    const isFull = currentPlayers >= maxPlayers;
    
    return `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-header">
                <span class="event-badge ${badgeClass}">${badgeText}</span>
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${escapeHtml(event.organizer_pseudo || 'Organisateur')}</p>
                <p class="event-players ${isFull ? 'full' : ''}">
                    <span class="icon">👥</span> ${currentPlayers}/${maxPlayers} joueurs
                    ${isFull ? '<span class="full-badge">COMPLET</span>' : ''}
                </p>
            </div>
            <button class="event-btn" data-event-id="${event.id}">Voir détails</button>
        </div>
    `;
}

async function showEventModal(eventId) {
    try {

        const url = `${API_CONFIG.BASE_URL}/get_event_by_id.php?event_id=${eventId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Détails de l\'événement:', result);
        
        if (!result.success || !result.data) {
            showNotification('Impossible de charger les détails de l\'événement', 'error');
            return;
        }
        
        const event = result.data;
        const user = getCurrentUser();
        const isFull = (event.current_players || 0) >= event.max_players;
        const canRegister = user && user.role_id === 2 && !isFull;

        const modalHtml = createEventModalHtml(event, user, isFull, canRegister);
        
        const existingModal = document.getElementById('eventModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('eventModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        setupModalClose(modal);
        
        if (canRegister) {
            setupEventRegistration(eventId, user.id);
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la modal:', error);
        showNotification('Erreur lors du chargement des détails', 'error');
    }
}

function createEventModalHtml(event, user, isFull, canRegister) {
    return `
        <div id="eventModal" class="modal">
            <div class="modal-content modal-large">
                <span class="close">&times;</span>
                <div class="modal-header">
                    <h2>${escapeHtml(event.title)}</h2>
                    <span class="event-badge">${event.status === 'validated' ? 'Validé' : event.status}</span>
                </div>
                <div class="modal-body">
                    <div class="event-info">
                        <div class="info-row">
                            <strong>Organisateur:</strong>
                            <span>${escapeHtml(event.organizer_pseudo || 'Organisateur')}</span>
                        </div>
                        <div class="info-row">
                            <strong>Date de début:</strong>
                            <span>${formatDatetime(event.start_date)}</span>
                        </div>
                        <div class="info-row">
                            <strong>Date de fin:</strong>
                            <span>${formatDatetime(event.end_date)}</span>
                        </div>
                        <div class="info-row">
                            <strong>Participants:</strong>
                            <span>${event.current_players || 0}/${event.max_players} joueurs ${isFull ? '(COMPLET)' : ''}</span>
                        </div>
                    </div>
                    <div class="event-description">
                        <h3>Description</h3>
                        <p>${escapeHtml(event.description)}</p>
                    </div>
                    ${canRegister ? `
                        <div class="event-actions">
                            <button class="btn-primary" id="registerEventBtn">S'inscrire à l'événement</button>
                        </div>
                    ` : !user ? `
                        <div class="event-actions">
                            <p class="info-message">Connectez-vous pour vous inscrire à cet événement</p>
                            <a href="../index.html" class="btn-primary">Se connecter</a>
                        </div>
                    ` : isFull ? `
                        <div class="event-actions">
                            <p class="warning-message">Cet événement est complet</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function setupEventRegistration(eventId, userId) {
    const registerBtn = document.getElementById('registerEventBtn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', async function() {
            try {
                this.disabled = true;
                this.textContent = 'Inscription...';
                
                const result = await apiRequest('REGISTER_TO_EVENT', 'POST', {
                    event_id: eventId,
                    user_id: userId
                });
                
                if (result.success) {
                    showNotification('Inscription réussie !', 'success');

                    setTimeout(() => {
                        document.getElementById('eventModal').style.display = 'none';
                        document.getElementById('eventModal').remove();
                        loadEvents();
                    }, 1500);
                    
                } else {
                    showNotification(result.message || 'Erreur lors de l\'inscription', 'error');
                    this.disabled = false;
                    this.textContent = 'S\'inscrire à l\'événement';
                }
                
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur de connexion', 'error');
                this.disabled = false;
                this.textContent = 'S\'inscrire à l\'événement';
            }
        });
    }
}

function setupModalClose(modal) {
    const closeBtn = modal.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        };
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            modal.remove();
            document.body.style.overflow = '';
        }
    };
}

function displayNoEvents() {
    const eventsContainer = document.getElementById('eventsGrid');
    
    if (eventsContainer) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <h3>Aucun événement disponible</h3>
                <p>Revenez bientôt pour découvrir de nouveaux tournois !</p>
            </div>
        `;
    }
}

function showLoading(show) {
    const eventsContainer = document.getElementById('eventsGrid');
    
    if (!eventsContainer) return;
    
    if (show) {
        eventsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Chargement des événements...</p>
            </div>
        `;
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    
    if (filterButtons) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filterType = this.getAttribute('data-filter');
                applyFilters(filterType);
            });
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterEventsBySearch(searchTerm);
        });
    }
}

function applyFilters(filterType) {
    const filters = {};
    
    if (filterType && filterType !== 'all') {
        filters.status = filterType;
    }
    
    loadEvents(filters);
}

function filterEventsBySearch(searchTerm) {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        const organizer = card.querySelector('.event-organizer').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || organizer.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatDatetime(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
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
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
