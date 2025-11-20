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

if (empty($data['admin_id'])) {
    $errors['admin_id'] = 'L\'ID administrateur est obligatoire';
} else {

    $userModel = new User();
    $admin = $userModel->getUserById($data['admin_id']);
    
    if (!$admin) {
        $errors['admin_id'] = 'Administrateur non trouvé';
    } elseif ($admin['role_id'] != 4) {
        Response::forbidden('Seuls les administrateurs peuvent modérer les événements');
    }
}

if (empty($data['event_id'])) {
    $errors['event_id'] = 'L\'ID de l\'événement est obligatoire';
}

if (empty($data['action'])) {
    $errors['action'] = 'L\'action est obligatoire (validate ou reject)';
} elseif (!in_array($data['action'], ['validate', 'reject'])) {
    $errors['action'] = 'L\'action doit être "validate" ou "reject"';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$eventModel = new Event();
$result = $eventModel->moderateEvent($data['event_id'], $data['action']);

if ($result['success']) {
    Response::success([
        'event_id' => $data['event_id'],
        'action' => $data['action'],
        'new_status' => $data['action'] === 'validate' ? 'validated' : 'rejected'
    ], $result['message']);
} else {
    Response::error($result['message'], 400);
}

?>
