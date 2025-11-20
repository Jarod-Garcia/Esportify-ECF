<?php


if ($_SERVER['HTTP_HOST'] === 'localhost' || 
    strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false ||
    strpos($_SERVER['HTTP_HOST'], 'xampp') !== false) {
    
  
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'esportify');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    
} else {
    
 
    define('DB_HOST', 'mysql-jarodgarcia.alwaysdata.net');
    define('DB_NAME', 'jarodgarcia_esportify_db');
    define('DB_USER', '441750');
    define('DB_PASS', 'Lamijajo1606)');  
}

define('DB_CHARSET', 'utf8mb4');

$pdo = null;

function getDB() {
    global $pdo;

    if ($pdo !== null) {
        return $pdo;
    }

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $pdo;
        
    } catch (PDOException $e) {

        if (isset($_GET['debug'])) {
            die(json_encode([
                'success' => false,
                'message' => 'Erreur de connexion à la base de données',
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]));
        }

        http_response_code(500);
        die(json_encode([
            'success' => false,
            'message' => 'Erreur de connexion au serveur. Veuillez réessayer plus tard.'
        ]));
    }
}

$pdo = getDB();

?>
