<?php

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/User.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée. Utilisez POST', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = [];

if (empty($data['pseudo'])) {
    $errors['pseudo'] = 'Le pseudo est obligatoire';
} elseif (strlen($data['pseudo']) < 3) {
    $errors['pseudo'] = 'Le pseudo doit contenir au moins 3 caractères';
} elseif (strlen($data['pseudo']) > 50) {
    $errors['pseudo'] = 'Le pseudo ne peut pas dépasser 50 caractères';
}

if (empty($data['email'])) {
    $errors['email'] = 'L\'email est obligatoire';
} elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'L\'email n\'est pas valide';
}

if (empty($data['password'])) {
    $errors['password'] = 'Le mot de passe est obligatoire';
} elseif (strlen($data['password']) < 8) {
    $errors['password'] = 'Le mot de passe doit contenir au moins 8 caractères';
}

if (empty($data['confirm_password'])) {
    $errors['confirm_password'] = 'La confirmation du mot de passe est obligatoire';
} elseif ($data['password'] !== $data['confirm_password']) {
    $errors['confirm_password'] = 'Les mots de passe ne correspondent pas';
}

$role_id = isset($data['role_id']) ? (int)$data['role_id'] : 2;

$allowed_roles = [2, 3];
if (!in_array($role_id, $allowed_roles)) {
    $errors['role_id'] = 'Rôle non autorisé pour l\'inscription';
}

if (!empty($errors)) {
    Response::validationError($errors);
}

$userModel = new User();

$result = $userModel->register(
    $data['pseudo'],
    $data['email'],
    $data['password'],
    $role_id
);

if ($result['success']) {
    Response::success([
        'user_id' => $result['user_id'],
        'pseudo' => $data['pseudo'],
        'email' => $data['email'],
        'role_id' => $role_id
    ], 'Inscription réussie ! Vous pouvez maintenant vous connecter.', 201);
} else {
    Response::error($result['message'], 400);
}

?>
