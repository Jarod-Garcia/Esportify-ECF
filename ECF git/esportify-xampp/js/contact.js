

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page contact chargée');

    const user = getCurrentUser();

    updateNavigation(user);
    
    if (user) {
        prefillContactForm(user);
    }

    setupContactForm();
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

function prefillContactForm(user) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (nameInput) nameInput.value = user.pseudo;
    if (emailInput) emailInput.value = user.email;
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !subject || !message) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Email invalide', 'error');
                return;
            }
            
            console.log('Message de contact:', { name, email, subject, message });

            showNotification('Message envoyé ! Nous vous répondrons dans les plus brefs délais.', 'success');
            contactForm.reset();
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

console.log('📜 Page contact initialisée');
