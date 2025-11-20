<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Participant.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Méthode non autorisée. Utilisez GET', 405);
}

if (empty($_GET['event_id'])) {
    Response::error('L\'ID de l\'événement est obligatoire', 400);
}

$eventId = (int)$_GET['event_id'];

$participantModel = new Participant();
$participants = $participantModel->getEventParticipants($eventId);

$accepted = [];
$pending = [];
$rejected = [];

foreach ($participants as $participant) {
    switch ($participant['status']) {
        case 'accepted':
            $accepted[] = $participant;
            break;
        case 'pending':
            $pending[] = $participant;
            break;
        case 'rejected':
            $rejected[] = $participant;
            break;
    }
}

Response::success([
    'all_participants' => $participants,
    'accepted' => $accepted,
    'pending' => $pending,
    'rejected' => $rejected,
    'total_count' => count($participants),
    'accepted_count' => count($accepted)
], 'Participants récupérés avec succès');

?>
