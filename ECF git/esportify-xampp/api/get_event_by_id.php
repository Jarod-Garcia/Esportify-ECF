<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Event.php';

// Autoriser les requêtes GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Méthode non autorisée. Utilisez GET', 405);
}

// Vérifier que l'ID de l'événement est fourni
if (!isset($_GET['event_id'])) {
    Response::error('ID de l\'événement requis', 400);
}

$event_id = (int)$_GET['event_id'];

if ($event_id <= 0) {
    Response::error('ID d\'événement invalide', 400);
}

try {
    $eventModel = new Event();
    
    // Récupérer l'événement par ID
    $event = $eventModel->getEventById($event_id);
    
    if (!$event) {
        Response::error('Événement introuvable', 404);
    }
    
    Response::success($event, 'Événement récupéré avec succès');
    
} catch (Exception $e) {
    error_log('Erreur get_event_by_id: ' . $e->getMessage());
    Response::error('Erreur lors de la récupération de l\'événement', 500);
}

?>
