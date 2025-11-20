<?php

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Message.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['message_id'])) {
    $errors['message_id'] = 'L\'ID du message est obligatoire';
}

if (empty($data['user_id'])) {
    $errors['user_id'] = 'L\'ID utilisateur est obligatoire';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$messageModel = new Message();
$result = $messageModel->deleteMessage($data['message_id'], $data['user_id']);

if ($result['success']) {
    Response::success([], $result['message']);
} else {
    Response::error($result['message'], 400);
}

?>
