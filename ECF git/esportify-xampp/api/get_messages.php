<?php

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Message.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Méthode non autorisée. Utilisez GET', 405);
}

if (empty($_GET['event_id'])) {
    Response::error('L\'ID de l\'événement est obligatoire', 400);
}

$eventId = (int)$_GET['event_id'];
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

$messageModel = new Message();
$messages = $messageModel->getMessages($eventId, $limit);
$count = $messageModel->countMessages($eventId);

Response::success([
    'messages' => $messages,
    'count' => $count,
    'event_id' => $eventId
], 'Messages récupérés avec succès');

?>
