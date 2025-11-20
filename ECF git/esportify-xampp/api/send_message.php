<?php

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Message.php';
require_once __DIR__ . '/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['event_id'])) {
    $errors['event_id'] = 'L\'ID de l\'événement est obligatoire';
}

if (empty($data['user_id'])) {
    $errors['user_id'] = 'L\'ID utilisateur est obligatoire';
}

if (empty($data['content'])) {
    $errors['content'] = 'Le contenu du message est obligatoire';
} elseif (strlen($data['content']) > 500) {
    $errors['content'] = 'Le message ne peut pas dépasser 500 caractères';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$userModel = new User();
$user = $userModel->getUserById($data['user_id']);

if (!$user) {
    Response::error('Utilisateur non trouvé', 404);
}

$messageModel = new Message();
$result = $messageModel->sendMessage(
    $data['event_id'],
    $data['user_id'],
    $user['pseudo'],
    $data['content']
);

if ($result['success']) {
    Response::success([
        'event_id' => $data['event_id'],
        'user_id' => $data['user_id'],
        'pseudo' => $user['pseudo'],
        'content' => $data['content']
    ], 'Message envoyé avec succès', 201);
} else {
    Response::error($result['message'], 400);
}

?>
