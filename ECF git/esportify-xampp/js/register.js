

let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page d\'inscription chargée');
    
    // Initialiser l'affichage du premier step
    showStep(1);
    
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Utiliser les bons IDs du HTML
            const username = document.getElementById('username')?.value;
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const firstName = document.getElementById('firstName')?.value;
            const lastName = document.getElementById('lastName')?.value;
            const birthdate = document.getElementById('birthdate')?.value;
            
            // Role par défaut : 2 (joueur)
            const roleId = 2;
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (!username || !email || !password || !confirmPassword) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Inscription en cours...';
            
            try {

                const result = await apiRequest('REGISTER', 'POST', {
                    pseudo: username,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword,
                    role_id: roleId
                });
                
                console.log('Résultat inscription:', result);
                
                if (result.success) {
                    showNotification('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');

                    setTimeout(function() {
                        window.location.href = '../index.html';
                    }, 2000);
                    
                } else {
                    showNotification(result.message || 'Erreur lors de l\'inscription', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'S\'inscrire';
                }
                
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur de connexion au serveur', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'S\'inscrire';
            }
        });
    }

    const roleSelect = document.getElementById('role_id');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const roleInfo = document.getElementById('roleInfo');
            if (roleInfo) {
                if (this.value === '2') {
                    roleInfo.textContent = 'En tant que joueur, vous pourrez vous inscrire aux événements';
                } else if (this.value === '3') {
                    roleInfo.textContent = 'En tant qu\'organisateur, vous pourrez créer et gérer des événements';
                }
            }
        });
    }
});

// Fonction pour passer à l'étape suivante
function nextStep(step) {
    // Valider l'étape actuelle avant de continuer
    if (!validateStep(step)) {
        return;
    }
    
    if (step < totalSteps) {
        currentStep = step + 1;
        showStep(currentStep);
        updateProgressBar();
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.nextStep = nextStep;

// Fonction pour revenir à l'étape précédente
function prevStep(step) {
    if (step > 1) {
        currentStep = step - 1;
        showStep(currentStep);
        updateProgressBar();
    }
}
// ✅ RENDRE GLOBALE pour onclick
window.prevStep = prevStep;

// Fonction pour afficher une étape spécifique
function showStep(step) {
    // Masquer toutes les étapes
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(stepElement => {
        stepElement.classList.remove('active');
    });
    
    // Afficher l'étape demandée
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Mettre à jour les indicateurs d'étapes
    const stepIndicators = document.querySelectorAll('.step');
    stepIndicators.forEach(indicator => {
        const indicatorStep = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        
        if (indicatorStep < step) {
            indicator.classList.add('completed');
        } else if (indicatorStep === step) {
            indicator.classList.add('active');
        }
    });
    
    currentStep = step;
    updateProgressBar();
}

// Fonction pour mettre à jour la barre de progression
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = progress + '%';
    }
    
    // Mettre à jour les indicateurs d'étapes
    const stepIndicators = document.querySelectorAll('.step-indicator');
    stepIndicators.forEach((indicator, index) => {
        if (index < currentStep) {
            indicator.classList.add('completed');
        } else {
            indicator.classList.remove('completed');
        }
    });
}

// Fonction pour valider une étape
function validateStep(step) {
    if (step === 1) {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (!email || !password || !confirmPassword) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return false;
        }
        
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return false;
        }
        
        if (password.length < 8) {
            showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
            return false;
        }
        
        if (password !== confirmPassword) {
            showNotification('Les mots de passe ne correspondent pas', 'error');
            return false;
        }
    } else if (step === 2) {
        const username = document.getElementById('username')?.value;
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const birthdate = document.getElementById('birthdate')?.value;
        
        if (!username || !firstName || !lastName || !birthdate) {
            showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return false;
        }
    }
    
    return true;
}

// Fonction pour rediriger vers le dashboard approprié
function redirectToDashboard() {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    
    let url = 'dashboard-player-unified.html';
    
    if (user.role_id === 4) {
        url = 'dashboard-admin-unified.html';
    } else if (user.role_id === 3) {
        url = 'dashboard-organizer-unified.html';
    }
    
    window.location.href = url;
}
// ✅ RENDRE GLOBALE pour onclick
window.redirectToDashboard = redirectToDashboard;

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
