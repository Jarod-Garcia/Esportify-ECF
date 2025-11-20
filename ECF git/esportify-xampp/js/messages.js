

class MessageSystem {
    constructor(eventId, userId) {
        this.eventId = eventId;
        this.userId = userId;
        this.messages = [];
        this.autoRefreshInterval = null;
        this.autoRefreshDelay = 3000;

        this.messagesDisplay = document.getElementById('messages-display');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-message-btn');
        this.charCounter = document.getElementById('char-counter');
        this.messagesCount = document.getElementById('messages-count');
        
        this.init();
    }

    init() {
        console.log('Initialisation du système de messagerie...', {
            eventId: this.eventId,
            userId: this.userId
        });

        this.loadMessages();

        this.setupEventListeners();

        this.startAutoRefresh();
    }

    setupEventListeners() {

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.messageInput.addEventListener('input', () => {
                this.updateCharCounter();
                this.adjustTextareaHeight();
            });
        }
    }

    async loadMessages() {
        try {
            const response = await fetch(`../api/get_messages.php?event_id=${this.eventId}`);
            const data = await response.json();

            if (data.success) {
                this.messages = data.data.messages || [];
                this.renderMessages();
                this.updateMessagesCount(data.data.count || 0);

                this.scrollToBottom();
            } else {
                console.error('Erreur lors du chargement des messages:', data.message);
            }
        } catch (error) {
            console.error('Erreur réseau lors du chargement des messages:', error);
        }
    }

    async sendMessage() {
        const content = this.messageInput.value.trim();

        if (!content) {
            this.showNotification('Le message ne peut pas être vide', 'error');
            return;
        }

        if (content.length > 500) {
            this.showNotification('Le message ne peut pas dépasser 500 caractères', 'error');
            return;
        }

        this.sendBtn.disabled = true;
        this.sendBtn.innerHTML = '<span class="loading-spinner"></span>';

        try {
            const response = await fetch('../api/send_message.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: this.eventId,
                    user_id: this.userId,
                    content: content
                })
            });

            const data = await response.json();

            if (data.success) {

                this.messageInput.value = '';
                this.updateCharCounter();
                this.adjustTextareaHeight();

                await this.loadMessages();

                this.showNotification('Message envoyé !', 'success');
            } else {
                this.showNotification(data.message || 'Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            console.error('Erreur réseau lors de l\'envoi:', error);
            this.showNotification('Erreur de connexion', 'error');
        } finally {

            this.sendBtn.disabled = false;
            this.sendBtn.innerHTML = '<span class="send-icon">📤</span> Envoyer';
        }
    }

    renderMessages() {
        if (!this.messagesDisplay) return;

        if (this.messages.length === 0) {
            this.messagesDisplay.innerHTML = `
                <div class="messages-empty">
                    <div class="messages-empty-icon">💬</div>
                    <div class="messages-empty-text">Aucun message pour le moment</div>
                    <div class="messages-empty-subtext">Soyez le premier à démarrer la conversation !</div>
                </div>
            `;
            return;
        }

        this.messagesDisplay.innerHTML = this.messages.map(msg => 
            this.createMessageHTML(msg)
        ).join('');
    }

    createMessageHTML(message) {
        const isOwnMessage = parseInt(message.user_id) === parseInt(this.userId);
        const initials = this.getInitials(message.pseudo);
        const formattedTime = this.formatTime(message.created_at);

        return `
            <div class="message-bubble ${isOwnMessage ? 'own-message' : ''}" data-message-id="${message.id || ''}">
                <div class="message-avatar">${initials}</div>
                <div class="message-content-wrapper">
                    <div class="message-header">
                        <span class="message-author">${this.escapeHtml(message.pseudo)}</span>
                        <span class="message-time">${formattedTime}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.content)}</div>
                    ${isOwnMessage ? `
                        <div class="message-actions">
                            <button class="message-action-btn delete-message" onclick="messageSystem.deleteMessage('${message.id || ''}')">
                                🗑️ Supprimer
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async deleteMessage(messageId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            return;
        }

        try {
            const response = await fetch('../api/delete_message.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message_id: messageId,
                    user_id: this.userId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Message supprimé', 'success');
                await this.loadMessages();
            } else {
                this.showNotification(data.message || 'Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    getInitials(pseudo) {
        if (!pseudo) return '??';
        const words = pseudo.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return pseudo.substring(0, 2).toUpperCase();
    }

    formatTime(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;

            if (diff < 60000) {
                return 'À l\'instant';
            }

            if (diff < 3600000) {
                const minutes = Math.floor(diff / 60000);
                return `Il y a ${minutes} min`;
            }

            if (date.toDateString() === now.toDateString()) {
                return date.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }

            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return 'Hier ' + date.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }

            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateCharCounter() {
        if (!this.charCounter || !this.messageInput) return;

        const length = this.messageInput.value.length;
        const max = 500;
        
        this.charCounter.textContent = `${length}/${max}`;
        
        if (length > max * 0.9) {
            this.charCounter.classList.add('warning');
        } else {
            this.charCounter.classList.remove('warning');
        }
    }

    adjustTextareaHeight() {
        if (!this.messageInput) return;

        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    scrollToBottom(smooth = true) {
        if (!this.messagesDisplay) return;

        setTimeout(() => {
            this.messagesDisplay.scrollTo({
                top: this.messagesDisplay.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }, 100);
    }

    updateMessagesCount(count) {
        if (this.messagesCount) {
            this.messagesCount.textContent = count;
        }
    }

    showNotification(message, type = 'info') {

        const existingNotifications = document.querySelectorAll('.message-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `message-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startAutoRefresh() {

        this.autoRefreshInterval = setInterval(() => {
            this.loadMessages();
        }, this.autoRefreshDelay);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        console.log('Système de messagerie arrêté');
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
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

let messageSystem;

function initMessageSystem(eventId, userId) {
    console.log('Initialisation du système de messagerie avec:', { eventId, userId });
    
    if (messageSystem) {
        messageSystem.destroy();
    }
    
    messageSystem = new MessageSystem(eventId, userId);
    
    return messageSystem;
}

window.addEventListener('beforeunload', () => {
    if (messageSystem) {
        messageSystem.destroy();
    }
});
