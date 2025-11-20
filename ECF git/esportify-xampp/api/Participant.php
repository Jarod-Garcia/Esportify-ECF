<?php

require_once __DIR__ . '/database.php';

class Participant {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function registerToEvent($eventId, $userId) {
        try {

            $stmt = $this->db->prepare("
                SELECT id, max_players, status, is_visible 
                FROM events 
                WHERE id = ?
            ");
            $stmt->execute([$eventId]);
            $event = $stmt->fetch();
            
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Événement non trouvé'
                ];
            }
            
            if ($event['status'] !== 'validated' || !$event['is_visible']) {
                return [
                    'success' => false,
                    'message' => 'Cet événement n\'est pas disponible pour l\'inscription'
                ];
            }

            $stmt = $this->db->prepare("
                SELECT id, status 
                FROM event_participants 
                WHERE event_id = ? AND user_id = ?
            ");
            $stmt->execute([$eventId, $userId]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                if ($existing['status'] === 'rejected') {
                    return [
                        'success' => false,
                        'message' => 'Vous avez été refusé pour cet événement et ne pouvez plus vous réinscrire'
                    ];
                }
                return [
                    'success' => false,
                    'message' => 'Vous êtes déjà inscrit à cet événement'
                ];
            }

            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count 
                FROM event_participants 
                WHERE event_id = ? AND status = 'accepted'
            ");
            $stmt->execute([$eventId]);
            $result = $stmt->fetch();
            
            if ($result['count'] >= $event['max_players']) {
                return [
                    'success' => false,
                    'message' => 'L\'événement est complet'
                ];
            }

            $stmt = $this->db->prepare("
                INSERT INTO event_participants (event_id, user_id, status) 
                VALUES (?, ?, 'accepted')
            ");
            $stmt->execute([$eventId, $userId]);
            
            return [
                'success' => true,
                'message' => 'Inscription réussie à l\'événement'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ];
        }
    }

    public function unregisterFromEvent($eventId, $userId) {
        try {

            $stmt = $this->db->prepare("
                SELECT id, status 
                FROM event_participants 
                WHERE event_id = ? AND user_id = ?
            ");
            $stmt->execute([$eventId, $userId]);
            $participation = $stmt->fetch();
            
            if (!$participation) {
                return [
                    'success' => false,
                    'message' => 'Vous n\'êtes pas inscrit à cet événement'
                ];
            }

            $stmt = $this->db->prepare("
                DELETE FROM event_participants 
                WHERE event_id = ? AND user_id = ?
            ");
            $stmt->execute([$eventId, $userId]);
            
            return [
                'success' => true,
                'message' => 'Désinscription réussie'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la désinscription',
                'error' => $e->getMessage()
            ];
        }
    }

   public function getUserEvents($userId) {
    try {
        $stmt = $this->db->prepare("
            SELECT 
                e.*,
                ep.status as participation_status,
                ep.created_at as registration_date,
                u.pseudo as organizer_pseudo,
                COUNT(DISTINCT ep2.id) as current_players
            FROM event_participants ep
            LEFT JOIN events e ON ep.event_id = e.id
            LEFT JOIN users u ON e.organizer_id = u.id
            LEFT JOIN event_participants ep2 ON e.id = ep2.event_id AND ep2.status = 'accepted'
            WHERE ep.user_id = ?
            GROUP BY e.id
            ORDER BY e.start_date ASC
        ");
        
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
        
    } catch (PDOException $e) {
        return [];
    }
}

    public function getEventParticipants($eventId) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    ep.*,
                    u.pseudo,
                    u.email,
                    u.avatar_url
                FROM event_participants ep
                LEFT JOIN users u ON ep.user_id = u.id
                WHERE ep.event_id = ?
                ORDER BY ep.registered_at ASC
            ");
            
            $stmt->execute([$eventId]);
            return $stmt->fetchAll();
            
        } catch (PDOException $e) {
            return [];
        }
    }

    public function toggleFavorite($eventId, $userId, $isFavorite) {
        try {
            $stmt = $this->db->prepare("
                UPDATE event_participants 
                SET is_favorite = ? 
                WHERE event_id = ? AND user_id = ?
            ");
            
            $stmt->execute([$isFavorite ? 1 : 0, $eventId, $userId]);
            
            return [
                'success' => true,
                'message' => $isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ];
        }
    }

    public function moderateParticipant($participationId, $organizerId, $action) {
        try {

            $stmt = $this->db->prepare("
                SELECT ep.*, e.organizer_id 
                FROM event_participants ep
                LEFT JOIN events e ON ep.event_id = e.id
                WHERE ep.id = ?
            ");
            $stmt->execute([$participationId]);
            $participation = $stmt->fetch();
            
            if (!$participation) {
                return [
                    'success' => false,
                    'message' => 'Participation non trouvée'
                ];
            }
            
            if ($participation['organizer_id'] != $organizerId) {
                return [
                    'success' => false,
                    'message' => 'Vous n\'êtes pas l\'organisateur de cet événement'
                ];
            }
            
            $newStatus = ($action === 'accept') ? 'accepted' : 'rejected';
            
            $stmt = $this->db->prepare("
                UPDATE event_participants 
                SET status = ? 
                WHERE id = ?
            ");
            $stmt->execute([$newStatus, $participationId]);
            
            $message = ($action === 'accept') ? 'Participant accepté' : 'Participant refusé';
            
            return [
                'success' => true,
                'message' => $message
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la modération',
                'error' => $e->getMessage()
            ];
        }
    }
}

?>
