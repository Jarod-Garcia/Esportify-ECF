<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Participant.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Méthode non autorisée. Utilisez GET', 405);
}

if (empty($_GET['user_id'])) {
    Response::error('L\'ID utilisateur est obligatoire', 400);
}

$userId = (int)$_GET['user_id'];

$participantModel = new Participant();
$events = $participantModel->getUserEvents($userId);

$upcoming = [];
$ongoing = [];
$finished = [];

foreach ($events as $event) {
    if ($event['status'] === 'finished') {
        $finished[] = $event;
    } elseif ($event['status'] === 'ongoing') {
        $ongoing[] = $event;
    } else {
        $upcoming[] = $event;
    }
}

Response::success([
    'all_events' => $events,
    'upcoming' => $upcoming,
    'ongoing' => $ongoing,
    'finished' => $finished,
    'total_count' => count($events)
], 'Événements récupérés avec succès');
