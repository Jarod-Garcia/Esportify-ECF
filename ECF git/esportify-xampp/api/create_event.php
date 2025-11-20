<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Event.php';
require_once __DIR__ . '/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['user_id'])) {
    $errors['user_id'] = 'L\'ID utilisateur est obligatoire';
} else {

    $userModel = new User();
    $user = $userModel->getUserById($data['user_id']);
    
    if (!$user) {
        $errors['user_id'] = 'Utilisateur non trouvé';
    } elseif (!in_array($user['role_id'], [3, 4])) {
        Response::forbidden('Vous devez être organisateur ou administrateur pour créer un événement');
    }
}

if (empty($data['title'])) {
    $errors['title'] = 'Le titre est obligatoire';
} elseif (strlen($data['title']) > 200) {
    $errors['title'] = 'Le titre ne peut pas dépasser 200 caractères';
}

if (empty($data['description'])) {
    $errors['description'] = 'La description est obligatoire';
}

if (empty($data['max_players'])) {
    $errors['max_players'] = 'Le nombre maximum de joueurs est obligatoire';
} elseif (!is_numeric($data['max_players']) || $data['max_players'] < 2) {
    $errors['max_players'] = 'Le nombre de joueurs doit être au minimum 2';
}

if (empty($data['start_date'])) {
    $errors['start_date'] = 'La date de début est obligatoire';
} elseif (strtotime($data['start_date']) === false) {
    $errors['start_date'] = 'Format de date invalide';
} elseif (strtotime($data['start_date']) < time()) {
    $errors['start_date'] = 'La date de début doit être dans le futur';
}

if (empty($data['end_date'])) {
    $errors['end_date'] = 'La date de fin est obligatoire';
} elseif (strtotime($data['end_date']) === false) {
    $errors['end_date'] = 'Format de date invalide';
} elseif (!empty($data['start_date']) && strtotime($data['end_date']) <= strtotime($data['start_date'])) {
    $errors['end_date'] = 'La date de fin doit être après la date de début';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$eventModel = new Event();
$result = $eventModel->createEvent([
    'title' => $data['title'],
    'description' => $data['description'],
    'max_players' => (int)$data['max_players'],
    'organizer_id' => $data['user_id'],
    'start_date' => $data['start_date'],
    'end_date' => $data['end_date']
]);

if ($result['success']) {
    Response::success([
        'event_id' => $result['event_id'],
        'status' => 'pending',
        'message' => 'Votre événement sera visible une fois validé par un administrateur'
    ], $result['message'], 201);
} else {
    Response::error($result['message'], 400);
}

?>
