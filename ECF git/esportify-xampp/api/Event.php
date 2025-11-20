<?php

require_once __DIR__ . '/database.php';

class Event {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function createEvent($data) {
        try {

            if (strtotime($data['end_date']) <= strtotime($data['start_date'])) {
                return [
                    'success' => false,
                    'message' => 'La date de fin doit être après la date de début'
                ];
            }

            $stmt = $this->db->prepare("
                INSERT INTO events (title, description, max_players, organizer_id, start_date, end_date, status, is_visible) 
                VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)
            ");
            
            $stmt->execute([
                $data['title'],
                $data['description'],
                $data['max_players'],
                $data['organizer_id'],
                $data['start_date'],
                $data['end_date']
            ]);
            
            $eventId = $this->db->lastInsertId();
            
            return [
                'success' => true,
                'message' => 'Événement créé avec succès. En attente de validation.',
                'event_id' => $eventId
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la création de l\'événement',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getAllEvents($status = null, $onlyVisible = true) {
        try {
            $sql = "
                SELECT 
                    e.*,
                    u.pseudo as organizer_pseudo,
                    u.email as organizer_email,
                    COUNT(DISTINCT ep.id) as current_players
                FROM events e
                LEFT JOIN users u ON e.organizer_id = u.id
                LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.status = 'accepted'
            ";
            
            $conditions = [];
            $params = [];

            if ($status !== null) {
                $conditions[] = "e.status = ?";
                $params[] = $status;
            }

            if ($onlyVisible) {
                $conditions[] = "e.is_visible = 1";
            }

            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(" AND ", $conditions);
            }
            
            $sql .= " GROUP BY e.id ORDER BY e.created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll();
            
        } catch (PDOException $e) {
            return [];
        }
    }

    public function getEventById($eventId) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    e.*,
                    u.pseudo as organizer_pseudo,
                    u.email as organizer_email,
                    COUNT(DISTINCT ep.id) as current_players
                FROM events e
                LEFT JOIN users u ON e.organizer_id = u.id
                LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.status = 'accepted'
                WHERE e.id = ?
                GROUP BY e.id
            ");
            
            $stmt->execute([$eventId]);
            return $stmt->fetch();
            
        } catch (PDOException $e) {
            return null;
        }
    }

    public function getEventsByOrganizer($organizerId) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    e.*,
                    COUNT(DISTINCT ep.id) as current_players
                FROM events e
                LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.status = 'accepted'
                WHERE e.organizer_id = ?
                GROUP BY e.id
                ORDER BY e.created_at DESC
            ");
            
            $stmt->execute([$organizerId]);
            return $stmt->fetchAll();
            
        } catch (PDOException $e) {
            return [];
        }
    }

    public function updateEvent($eventId, $data, $userId) {
        try {

            $event = $this->getEventById($eventId);
            
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Événement non trouvé'
                ];
            }
            
            if ($event['organizer_id'] != $userId) {
                return [
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier cet événement'
                ];
            }

            $newStatus = ($event['status'] === 'validated') ? 'pending' : $event['status'];

            $stmt = $this->db->prepare("
                UPDATE events 
                SET title = ?, 
                    description = ?, 
                    max_players = ?, 
                    start_date = ?, 
                    end_date = ?,
                    status = ?,
                    is_visible = 0
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['title'],
                $data['description'],
                $data['max_players'],
                $data['start_date'],
                $data['end_date'],
                $newStatus,
                $eventId
            ]);
            
            return [
                'success' => true,
                'message' => 'Événement mis à jour. En attente de nouvelle validation.'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ];
        }
    }

    public function moderateEvent($eventId, $action) {
        try {
            $event = $this->getEventById($eventId);
            
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Événement non trouvé'
                ];
            }
            
            if ($action === 'validate') {
                $stmt = $this->db->prepare("
                    UPDATE events 
                    SET status = 'validated', is_visible = 1 
                    WHERE id = ?
                ");
                $message = 'Événement validé avec succès';
            } else {
                $stmt = $this->db->prepare("
                    UPDATE events 
                    SET status = 'rejected', is_visible = 0 
                    WHERE id = ?
                ");
                $message = 'Événement rejeté';
            }
            
            $stmt->execute([$eventId]);
            
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

    public function deleteEvent($eventId, $userId) {
        try {
            $event = $this->getEventById($eventId);
            
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Événement non trouvé'
                ];
            }
            
            if ($event['organizer_id'] != $userId) {
                return [
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer cet événement'
                ];
            }
            
            $stmt = $this->db->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$eventId]);
            
            return [
                'success' => true,
                'message' => 'Événement supprimé avec succès'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ];
        }
    }

    public function startEvent($eventId, $userId) {
        try {
            $event = $this->getEventById($eventId);
            
            if (!$event) {
                return [
                    'success' => false,
                    'message' => 'Événement non trouvé'
                ];
            }
            
            if ($event['organizer_id'] != $userId) {
                return [
                    'success' => false,
                    'message' => 'Vous n\'êtes pas l\'organisateur de cet événement'
                ];
            }

            $now = new DateTime();
            $startDate = new DateTime($event['start_date']);
            $diff = $now->diff($startDate);
            $minutesDiff = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
            
            if ($diff->invert == 0 && $minutesDiff > 30) {
                return [
                    'success' => false,
                    'message' => 'L\'événement ne peut être démarré que 30 minutes avant l\'heure de début'
                ];
            }
            
            $stmt = $this->db->prepare("
                UPDATE events 
                SET status = 'ongoing', can_start = 1 
                WHERE id = ?
            ");
            $stmt->execute([$eventId]);
            
            return [
                'success' => true,
                'message' => 'Événement démarré avec succès'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors du démarrage',
                'error' => $e->getMessage()
            ];
        }
    }
}

?>
