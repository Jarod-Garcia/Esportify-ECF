<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Event.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Méthode non autorisée. Utilisez GET', 405);
}

$status = isset($_GET['status']) ? $_GET['status'] : null;
$organizer_id = isset($_GET['organizer_id']) ? (int)$_GET['organizer_id'] : null;
$show_all = isset($_GET['show_all']) && $_GET['show_all'] === 'true';

$eventModel = new Event();

if ($organizer_id !== null) {

    $events = $eventModel->getEventsByOrganizer($organizer_id);
} else {

    $onlyVisible = !$show_all;
    $events = $eventModel->getAllEvents($status, $onlyVisible);
}

Response::success([
    'events' => $events,
    'count' => count($events)
], 'Événements récupérés avec succès');

?>
