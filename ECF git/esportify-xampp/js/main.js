

console.log('🎮 SCRIPT ESPORTIFY CHARGÉ');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM PRÊT');

    checkAuthStatus();

    loadUpcomingEvents();

    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔓 CLIC CONNEXION !');
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
                
                console.log('Résultat connexion:', result);
                
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
});

function checkAuthStatus() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    
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
    }
}

function redirectToDashboard(roleId) {
    let url = 'pages/dashboard-player-unified.html';
    
    if (roleId === 4) {

        url = 'pages/dashboard-admin-unified.html';
    } else if (roleId === 3) {

        url = 'pages/dashboard-organizer-unified.html';
    } else {

        url = 'pages/dashboard-player-unified.html';
    }
    
    window.location.href = url;
}

async function loadUpcomingEvents() {
    try {
        const result = await apiRequest('GET_EVENTS', 'GET');
        
        if (result.success && result.data && result.data.events) {
            const upcomingEventsContainer = document.getElementById('upcomingEvents');
            
            if (upcomingEventsContainer) {

                const events = result.data.events
                    .filter(event => event.status === 'validated' && (event.is_visible === 1 || event.is_visible === '1'))
                    .slice(0, 3);
                
                if (events.length > 0) {
                    upcomingEventsContainer.innerHTML = events.map(event => createEventCard(event)).join('');
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
    }
}

function createEventCard(event) {
    const startDate = new Date(event.start_date);
    const now = new Date();
    const badgeText = startDate > now ? 'À venir' : 'En cours';
    const badgeClass = startDate > now ? 'badge-upcoming' : 'badge-ongoing';
    
    return `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-header">
                <span class="event-badge ${badgeClass}">${badgeText}</span>
                <span class="event-date">${formatDate(event.start_date)}</span>
            </div>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-details">
                <p class="event-organizer">Par: ${event.organizer_pseudo || 'Organisateur'}</p>
                <p class="event-players">
                    <span class="icon">👥</span> ${event.current_players || 0}/${event.max_players} joueurs
                </p>
            </div>
            <button class="event-btn" onclick="viewEventDetails(${event.id})">Voir détails</button>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function viewEventDetails(eventId) {

    window.location.href = `pages/events.html?eventId=${eventId}`;
}
// Rendre la fonction globale pour les onclick HTML
window.viewEventDetails = viewEventDetails;

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

console.log('📜 FIN DU SCRIPT MAIN.JS');
