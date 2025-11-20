<?php

require_once __DIR__ . '/database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function register($pseudo, $email, $password, $role_id = 2) {
        try {

            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Cet email est déjà utilisé'
                ];
            }

            $stmt = $this->db->prepare("SELECT id FROM users WHERE pseudo = ?");
            $stmt->execute([$pseudo]);
            
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Ce pseudo est déjà utilisé'
                ];
            }

            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->db->prepare("
                INSERT INTO users (pseudo, email, password, role_id) 
                VALUES (?, ?, ?, ?)
            ");
            
            $stmt->execute([$pseudo, $email, $hashedPassword, $role_id]);

            $userId = $this->db->lastInsertId();
            
            return [
                'success' => true,
                'message' => 'Inscription réussie',
                'user_id' => $userId
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ];
        }
    }

    public function login($email, $password) {
        try {

            $stmt = $this->db->prepare("
                SELECT u.*, r.name as role_name 
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.email = ?
            ");
            
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ];
            }

            if (!password_verify($password, $user['password'])) {
                return [
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ];
            }

            return [
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $user['id'],
                    'pseudo' => $user['pseudo'],
                    'email' => $user['email'],
                    'role_id' => $user['role_id'],
                    'role_name' => $user['role_name']
                ]
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getUserById($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT u.id, u.pseudo, u.email, u.role_id, u.created_at, r.name as role_name
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
            ");
            
            $stmt->execute([$userId]);
            return $stmt->fetch();
            
        } catch (PDOException $e) {
            return null;
        }
    }

    public function getAllUsers() {
        try {
            $stmt = $this->db->query("
                SELECT u.id, u.pseudo, u.email, u.role_id, u.created_at, r.name as role_name
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at DESC
            ");
            
            return $stmt->fetchAll();
            
        } catch (PDOException $e) {
            return [];
        }
    }

    public function updateUserRole($userId, $newRoleId) {
        try {
            $stmt = $this->db->prepare("UPDATE users SET role_id = ? WHERE id = ?");
            return $stmt->execute([$newRoleId, $userId]);
        } catch (PDOException $e) {
            return false;
        }
    }
}

?>
