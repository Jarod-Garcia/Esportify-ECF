
// Détection automatique de l'environnement
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('xampp');

const API_CONFIG = {
    // Si local → chemin complet, sinon → chemin relatif
    BASE_URL: isLocal ? 'http://localhost/esportify-xampp/api' : '/api',

    ENDPOINTS: {
        LOGIN: '/login.php',
        REGISTER: '/register.php',
        CREATE_EVENT: '/create_event.php',
        GET_EVENTS: '/get_events.php',
        GET_EVENT_BY_ID: '/get_event_by_id.php',
        GET_MY_EVENTS: '/get_my_events.php',
        REGISTER_TO_EVENT: '/register_to_event.php',
        UNREGISTER_FROM_EVENT: '/unregister_from_event.php',
        VALIDATE_EVENT: '/validate_event.php',
        GET_PARTICIPANTS: '/get_participants.php',
        GET_MESSAGES: '/get_messages.php',
        SEND_MESSAGE: '/send_message.php'
    }
};

function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint];
}

function getCurrentUser() {
    const userJson = localStorage.getItem('esportify_user');
    return userJson ? JSON.parse(userJson) : null;
}

function saveCurrentUser(user) {
    localStorage.setItem('esportify_user', JSON.stringify(user));
}

function logoutUser() {

    localStorage.removeItem('esportify_user');

    console.log('✅ Utilisateur déconnecté');

    if (window.location.pathname.includes('/pages/')) {

        window.location.replace('../index.html');
    } else {

        window.location.replace('index.html');
    }
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        alert('Vous devez être connecté pour accéder à cette page');

        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

function requireRole(allowedRoles) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role_id)) {
        alert('Vous n\'avez pas les permissions nécessaires');

        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        const url = getApiUrl(endpoint);
        console.log('API Request:', method, url, data);
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log('API Response:', result);
        
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        return {
            success: false,
            message: 'Erreur de connexion au serveur'
        };
    }
}

console.log('✅ Configuration API chargée - Environnement:', isLocal ? 'LOCAL' : 'PRODUCTION');
console.log('📍 BASE_URL:', API_CONFIG.BASE_URL);

// Attacher les fonctions au scope global pour les rendre accessibles
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.logoutUser = logoutUser;
window.requireAuth = requireAuth;
window.requireRole = requireRole;
window.apiRequest = apiRequest;
window.getApiUrl = getApiUrl;
