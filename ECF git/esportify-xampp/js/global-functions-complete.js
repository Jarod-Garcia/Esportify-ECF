// ============================================
// GLOBAL-FUNCTIONS-COMPLETE.JS
// PATCH COMPLET POUR TOUTES LES FONCTIONS
// ============================================

console.log('🔧 Application du patch global complet...');

// ==========================================
// FONCTIONS DU SLIDESHOW
// ==========================================
if (typeof changeSlide === 'function' && !window.changeSlide) {
    window.changeSlide = changeSlide;
}

if (typeof currentSlide === 'function' && !window.currentSlide) {
    window.currentSlide = currentSlide;
}

// ==========================================
// FONCTIONS DE CONFIG
// ==========================================
if (typeof getCurrentUser === 'function' && !window.getCurrentUser) {
    window.getCurrentUser = getCurrentUser;
}

if (typeof saveCurrentUser === 'function' && !window.saveCurrentUser) {
    window.saveCurrentUser = saveCurrentUser;
}

if (typeof logoutUser === 'function' && !window.logoutUser) {
    window.logoutUser = logoutUser;
}

if (typeof requireAuth === 'function' && !window.requireAuth) {
    window.requireAuth = requireAuth;
}

if (typeof requireRole === 'function' && !window.requireRole) {
    window.requireRole = requireRole;
}

if (typeof apiRequest === 'function' && !window.apiRequest) {
    window.apiRequest = apiRequest;
}

if (typeof getApiUrl === 'function' && !window.getApiUrl) {
    window.getApiUrl = getApiUrl;
}

// ==========================================
// FONCTIONS DE NAVIGATION
// ==========================================
if (typeof viewEventDetails === 'function' && !window.viewEventDetails) {
    window.viewEventDetails = viewEventDetails;
}

if (typeof redirectToDashboard === 'function' && !window.redirectToDashboard) {
    window.redirectToDashboard = redirectToDashboard;
} else if (!window.redirectToDashboard) {
    // Fonction de secours si elle n'existe pas
    window.redirectToDashboard = function(roleId) {
        let url = 'pages/dashboard-player-unified.html';
        const isInPages = window.location.pathname.includes('/pages/');
        const prefix = isInPages ? '' : 'pages/';
        
        if (roleId === 4) {
            url = prefix + 'dashboard-admin-unified.html';
        } else if (roleId === 3) {
            url = prefix + 'dashboard-organizer-unified.html';
        } else {
            url = prefix + 'dashboard-player-unified.html';
        }
        
        window.location.href = url;
    };
}

// ==========================================
// FONCTIONS DE NOTIFICATION
// ==========================================
if (typeof showNotification === 'function' && !window.showNotification) {
    window.showNotification = showNotification;
} else if (!window.showNotification) {
    // Fonction de secours si elle n'existe pas
    window.showNotification = function(message, type = 'info') {
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
    };
}

// ==========================================
// FONCTIONS D'INSCRIPTION
// ==========================================
if (typeof nextStep === 'function' && !window.nextStep) {
    window.nextStep = nextStep;
}

if (typeof prevStep === 'function' && !window.prevStep) {
    window.prevStep = prevStep;
}

// ==========================================
// FONCTIONS ADMIN
// ==========================================
if (typeof validateEvent === 'function' && !window.validateEvent) {
    window.validateEvent = validateEvent;
}

if (typeof rejectEvent === 'function' && !window.rejectEvent) {
    window.rejectEvent = rejectEvent;
}

if (typeof viewEventDetailsAdmin === 'function' && !window.viewEventDetailsAdmin) {
    window.viewEventDetailsAdmin = viewEventDetailsAdmin;
}

// ==========================================
// FONCTIONS ORGANISATEUR
// ==========================================
if (typeof createEvent === 'function' && !window.createEvent) {
    window.createEvent = createEvent;
}

if (typeof editEvent === 'function' && !window.editEvent) {
    window.editEvent = editEvent;
}

if (typeof deleteEvent === 'function' && !window.deleteEvent) {
    window.deleteEvent = deleteEvent;
}

if (typeof viewParticipants === 'function' && !window.viewParticipants) {
    window.viewParticipants = viewParticipants;
}

// ==========================================
// FONCTIONS JOUEUR
// ==========================================
if (typeof registerToEvent === 'function' && !window.registerToEvent) {
    window.registerToEvent = registerToEvent;
}

if (typeof unregisterFromEvent === 'function' && !window.unregisterFromEvent) {
    window.unregisterFromEvent = unregisterFromEvent;
}

// ==========================================
// FONCTIONS D'ONGLETS (TABS)
// ==========================================
if (typeof showTab === 'function' && !window.showTab) {
    window.showTab = showTab;
}

if (typeof showSection === 'function' && !window.showSection) {
    window.showSection = showSection;
}

if (typeof setupTabs === 'function' && !window.setupTabs) {
    window.setupTabs = setupTabs;
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================
if (typeof formatDate === 'function' && !window.formatDate) {
    window.formatDate = formatDate;
} else if (!window.formatDate) {
    window.formatDate = function(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };
}

if (typeof escapeHtml === 'function' && !window.escapeHtml) {
    window.escapeHtml = escapeHtml;
} else if (!window.escapeHtml) {
    window.escapeHtml = function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    };
}

// ==========================================
// VÉRIFICATION DES FONCTIONS CRITIQUES
// ==========================================
const criticalFunctions = [
    'getCurrentUser',
    'logoutUser',
    'apiRequest',
    'showNotification',
    'redirectToDashboard'
];

let missingFunctions = [];
criticalFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
        missingFunctions.push(funcName);
        console.warn(`⚠️ Fonction critique manquante: ${funcName}`);
    }
});

if (missingFunctions.length === 0) {
    console.log('✅ Toutes les fonctions critiques sont disponibles globalement');
} else {
    console.error('❌ Fonctions critiques manquantes:', missingFunctions);
}

// ==========================================
// AFFICHAGE DU STATUT
// ==========================================
console.log('📊 Statut des fonctions globales:', {
    config: {
        getCurrentUser: typeof window.getCurrentUser,
        logoutUser: typeof window.logoutUser,
        apiRequest: typeof window.apiRequest
    },
    navigation: {
        viewEventDetails: typeof window.viewEventDetails,
        redirectToDashboard: typeof window.redirectToDashboard
    },
    slideshow: {
        changeSlide: typeof window.changeSlide,
        currentSlide: typeof window.currentSlide
    },
    events: {
        registerToEvent: typeof window.registerToEvent,
        unregisterFromEvent: typeof window.unregisterFromEvent,
        validateEvent: typeof window.validateEvent,
        rejectEvent: typeof window.rejectEvent
    },
    inscription: {
        nextStep: typeof window.nextStep,
        prevStep: typeof window.prevStep
    },
    utils: {
        showNotification: typeof window.showNotification,
        formatDate: typeof window.formatDate
    }
});

console.log('✅ Patch global complet appliqué avec succès !');
