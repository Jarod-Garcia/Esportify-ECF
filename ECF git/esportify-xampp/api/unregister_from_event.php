<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Participant.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['user_id'])) {
    $errors['user_id'] = 'L\'ID utilisateur est obligatoire';
}

if (empty($data['event_id'])) {
    $errors['event_id'] = 'L\'ID de l\'événement est obligatoire';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$participantModel = new Participant();
$result = $participantModel->unregisterFromEvent($data['event_id'], $data['user_id']);

if ($result['success']) {
    Response::success([
        'event_id' => $data['event_id'],
        'user_id' => $data['user_id']
    ], $result['message']);
} else {
    Response::error($result['message'], 400);
}

?>
