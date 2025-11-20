<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['email'])) {
    $errors['email'] = 'L\'email est obligatoire';
} elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'L\'email n\'est pas valide';
}

if (empty($data['password'])) {
    $errors['password'] = 'Le mot de passe est obligatoire';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$userModel = new User();

$result = $userModel->login($data['email'], $data['password']);

if ($result['success']) {

    Response::success([
        'user' => $result['user'],
        'message' => 'Bienvenue ' . $result['user']['pseudo'] . ' !'
    ], 'Connexion réussie', 200);
} else {

    Response::error($result['message'], 401);
}

?>
