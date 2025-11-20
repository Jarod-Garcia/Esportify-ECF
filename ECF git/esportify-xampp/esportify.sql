-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 20 nov. 2025 à 19:41
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `esportify`
--

-- --------------------------------------------------------

--
-- Structure de la table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0,
  `replied` tinyint(1) DEFAULT 0,
  `reply_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `created_at`, `is_read`, `replied`, `reply_message`) VALUES
(1, 'Jean Dupont', 'jean.dupont@email.com', 'Question sur les tournois', 'Bonjour, je voudrais savoir s\'il y a des tournois pour débutants ?', '2025-11-19 17:21:14', 0, 0, NULL),
(2, 'Marie Martin', 'marie.martin@email.com', 'Problème d\'inscription', 'Je n\'arrive pas à m\'inscrire à un événement, pouvez-vous m\'aider ?', '2025-11-19 17:21:14', 1, 1, NULL),
(3, 'Pierre Durant', 'pierre@email.com', 'Partenariat', 'Je représente une marque de périphériques gaming et souhaiterais discuter d\'un partenariat.', '2025-11-19 17:21:14', 1, 0, NULL),
(4, 'Sophie Leroy', 'sophie.leroy@email.com', 'Feedback', 'Super plateforme ! Bravo pour le travail accompli.', '2025-11-19 17:21:14', 1, 1, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `max_players` int(11) NOT NULL DEFAULT 16,
  `current_players` int(11) DEFAULT 0,
  `organizer_id` int(11) NOT NULL,
  `status` enum('pending','validated','cancelled','completed') DEFAULT 'pending',
  `is_started` tinyint(1) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `start_date`, `end_date`, `location`, `max_players`, `current_players`, `organizer_id`, `status`, `is_started`, `is_visible`, `created_at`, `updated_at`) VALUES
(1, 'Tournoi League of Legends 2025', 'Grand tournoi League of Legends avec cash prize de 5000€. Ouvert à tous les niveaux. Format 5v5 en équipes. Inscription gratuite.', '2025-12-01 14:00:00', '2025-12-01 20:00:00', 'Paris, France', 32, 12, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(2, 'Championship Valorant', 'Compétition Valorant niveau expert. Format 5v5. Les meilleures équipes de France s\'affrontent pour le titre de champion.', '2025-12-05 16:00:00', '2025-12-05 22:00:00', 'Lyon, France', 40, 18, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(3, 'CS2 Winter Cup', 'Tournoi Counter-Strike 2 hivernal. Format 5v5. Cash prize: 3000€. Niveau intermédiaire à expert.', '2025-12-10 18:00:00', '2025-12-10 23:00:00', 'Marseille, France', 30, 15, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(4, 'Rocket League Finals', 'Grande finale Rocket League. Format 3v3. Le meilleur des meilleurs. Cash prize: 2000€.', '2025-12-15 15:00:00', '2025-12-15 21:00:00', 'Nice, France', 24, 9, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(5, 'Tournoi Fortnite Débutants', 'Tournoi Fortnite réservé aux débutants. Format Battle Royale solo. Inscription gratuite.', '2025-11-28 19:00:00', '2025-11-28 22:00:00', 'En ligne', 100, 45, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(6, 'Apex Legends Tournament', 'Compétition Apex Legends. Format 3v3. Niveau tous joueurs. Cash prize: 1500€.', '2025-12-20 17:00:00', '2025-12-20 23:00:00', 'Bordeaux, France', 30, 8, 6, 'pending', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:57:16'),
(7, 'Overwatch 2 Championship', 'Tournoi Overwatch 2 compétitif. Format 6v6. Niveau expert uniquement.', '2025-12-25 14:00:00', '2025-12-25 21:00:00', 'Toulouse, France', 36, 0, 6, 'validated', 0, 1, '2025-11-19 17:21:14', '2025-11-20 14:47:32'),
(8, 'tournois test', 'test', '2025-11-21 14:46:00', '2025-11-21 15:46:00', NULL, 16, 0, 6, 'validated', 0, 1, '2025-11-20 08:46:18', '2025-11-20 14:47:32'),
(9, 'test', 'test', '2025-11-21 12:47:00', '2025-11-21 14:47:00', NULL, 16, 0, 6, 'validated', 0, 1, '2025-11-20 08:47:33', '2025-11-20 14:47:32'),
(10, 'test', 'test', '2025-11-21 09:57:00', '2025-11-21 11:57:00', NULL, 10, 0, 6, 'pending', 0, 0, '2025-11-20 08:58:05', '2025-11-20 14:57:16'),
(11, 'test lol ', 'test', '2025-11-21 11:22:00', '2025-11-21 14:22:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 10:22:38', '2025-11-20 14:47:32'),
(12, 'test', 'test', '2025-11-21 11:40:00', '2025-11-21 13:40:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 10:40:53', '2025-11-20 14:47:32'),
(13, 'test', 'test', '2025-11-21 11:48:00', '2025-11-21 13:48:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 10:48:26', '2025-11-20 14:47:32'),
(14, 'test', 'test', '2025-11-21 11:50:00', '2025-11-21 13:50:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 10:50:16', '2025-11-20 14:47:32'),
(15, 'Tournois league of legends ', 'test', '2025-11-22 12:37:00', '2025-11-22 14:33:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 11:33:40', '2025-11-20 14:47:32'),
(16, 'test lol ', 'test', '2025-11-21 14:04:00', '2025-11-21 16:04:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 13:04:40', '2025-11-20 14:47:32'),
(17, 'test lol 2', 'test event ', '2025-11-21 14:15:00', '2025-11-21 16:16:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 13:16:06', '2025-11-20 14:47:32'),
(18, 'test lol ', 'test lol 3', '2025-11-21 15:35:00', '2025-11-21 17:35:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 14:36:38', '2025-11-20 14:40:47'),
(19, 'test 4', 'test4', '2025-11-21 15:43:00', '2025-11-21 17:43:00', NULL, 10, 0, 6, 'validated', 0, 1, '2025-11-20 14:44:06', '2025-11-20 14:47:32');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `events_with_organizer`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `events_with_organizer` (
`id` int(11)
,`title` varchar(200)
,`description` text
,`start_date` datetime
,`end_date` datetime
,`location` varchar(200)
,`max_players` int(11)
,`current_players` int(11)
,`organizer_id` int(11)
,`status` enum('pending','validated','cancelled','completed')
,`is_started` tinyint(1)
,`is_visible` tinyint(1)
,`created_at` timestamp
,`updated_at` timestamp
,`organizer_pseudo` varchar(50)
,`organizer_email` varchar(100)
,`organizer_role` varchar(50)
);

-- --------------------------------------------------------

--
-- Structure de la table `event_discussions`
--

CREATE TABLE `event_discussions` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `event_discussions`
--

INSERT INTO `event_discussions` (`id`, `event_id`, `user_id`, `message`, `created_at`) VALUES
(1, 1, 2, 'Hâte de participer à ce tournoi ! Quelqu\'un pour former une équipe ?', '2025-11-19 17:21:14'),
(2, 1, 4, 'Je suis partant ! J\'ai de l\'expérience en ranked Diamant.', '2025-11-19 17:21:14'),
(3, 1, 5, 'Team complète ? Je cherche aussi une équipe.', '2025-11-19 17:21:14'),
(4, 2, 2, 'Niveau requis minimum pour ce tournoi ?', '2025-11-19 17:21:14'),
(5, 3, 5, 'Première fois que je participe à un tournoi CS2. Des conseils ?', '2025-11-19 17:21:14');

-- --------------------------------------------------------

--
-- Structure de la table `event_images`
--

CREATE TABLE `event_images` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `event_images`
--

INSERT INTO `event_images` (`id`, `event_id`, `image_path`, `image_order`, `is_primary`, `created_at`) VALUES
(1, 1, 'assets/images/league of legend.jpg', 1, 1, '2025-11-19 17:21:14'),
(2, 2, 'assets/images/valorant.jpg', 1, 1, '2025-11-19 17:21:14'),
(3, 3, 'assets/images/cs2.png', 1, 1, '2025-11-19 17:21:14'),
(4, 4, 'assets/images/RL.jpg', 1, 1, '2025-11-19 17:21:14'),
(5, 5, 'assets/images/fortnite.jpg', 1, 1, '2025-11-19 17:21:14'),
(6, 6, 'assets/images/apex.jpg', 1, 1, '2025-11-19 17:21:14');

-- --------------------------------------------------------

--
-- Structure de la table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `event_participants`
--

INSERT INTO `event_participants` (`id`, `event_id`, `user_id`, `status`, `created_at`) VALUES
(1, 18, 7, 'accepted', '2025-11-20 16:04:55'),
(2, 17, 7, 'accepted', '2025-11-20 16:06:36'),
(3, 19, 7, 'accepted', '2025-11-20 16:06:46');

-- --------------------------------------------------------

--
-- Structure de la table `organizer_requests`
--

CREATE TABLE `organizer_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `request_message` text DEFAULT NULL,
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `organizer_requests`
--

INSERT INTO `organizer_requests` (`id`, `user_id`, `status`, `request_message`, `admin_response`, `created_at`, `reviewed_at`, `reviewed_by`) VALUES
(1, 7, 'pending', 'Je souhaite devenir organisateur pour créer des tournois Overwatch 2 dans ma région.', NULL, '2025-11-19 17:21:14', NULL, NULL),
(2, 4, 'approved', 'J\'aimerais organiser des événements e-sport pour ma communauté locale.', 'Demande approuvée - bienvenue parmi les organisateurs !', '2025-11-19 17:21:14', '2025-11-15 09:30:00', 1),
(3, 5, 'rejected', 'Je veux organiser des tournois.', 'Votre demande manque de détails. Veuillez reformuler avec plus d\'informations.', '2025-11-19 17:21:14', '2025-11-10 13:20:00', 1);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `organizer_requests_details`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `organizer_requests_details` (
`id` int(11)
,`user_id` int(11)
,`status` enum('pending','approved','rejected')
,`request_message` text
,`admin_response` text
,`created_at` timestamp
,`reviewed_at` timestamp
,`reviewed_by` int(11)
,`requester_pseudo` varchar(50)
,`requester_email` varchar(100)
,`reviewer_pseudo` varchar(50)
);

-- --------------------------------------------------------

--
-- Structure de la table `participants`
--

CREATE TABLE `participants` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','confirmed','cancelled','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `participants`
--

INSERT INTO `participants` (`id`, `event_id`, `user_id`, `registration_date`, `status`, `rejection_reason`) VALUES
(1, 1, 2, '2025-11-19 17:21:14', 'confirmed', NULL),
(2, 2, 2, '2025-11-19 17:21:14', 'confirmed', NULL),
(3, 3, 2, '2025-11-19 17:21:14', 'pending', NULL),
(4, 1, 4, '2025-11-19 17:21:14', 'confirmed', NULL),
(5, 1, 5, '2025-11-19 17:21:14', 'confirmed', NULL),
(6, 2, 4, '2025-11-19 17:21:14', 'confirmed', NULL),
(7, 4, 2, '2025-11-19 17:21:14', 'confirmed', NULL),
(8, 5, 4, '2025-11-19 17:21:14', 'confirmed', NULL),
(9, 3, 5, '2025-11-19 17:21:14', 'rejected', NULL),
(10, 4, 7, '2025-11-19 17:21:14', 'pending', NULL);

--
-- Déclencheurs `participants`
--
DELIMITER $$
CREATE TRIGGER `decrement_players_on_cancel` AFTER UPDATE ON `participants` FOR EACH ROW BEGIN
    IF (NEW.status = 'cancelled' OR NEW.status = 'rejected') 
       AND OLD.status = 'confirmed' THEN
        UPDATE events 
        SET current_players = current_players - 1 
        WHERE id = NEW.event_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `increment_players_on_confirm` AFTER UPDATE ON `participants` FOR EACH ROW BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE events 
        SET current_players = current_players + 1 
        WHERE id = NEW.event_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `participations_details`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `participations_details` (
`id` int(11)
,`event_id` int(11)
,`user_id` int(11)
,`registration_date` timestamp
,`status` enum('pending','confirmed','cancelled','rejected')
,`rejection_reason` text
,`user_pseudo` varchar(50)
,`user_email` varchar(100)
,`event_title` varchar(200)
,`event_date` datetime
,`event_status` enum('pending','validated','cancelled','completed')
);

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'visiteur', 'Utilisateur non connecté - peut consulter les événements', '2025-11-19 17:21:14'),
(2, 'joueur', 'Joueur inscrit - peut participer aux événements', '2025-11-19 17:21:14'),
(3, 'organisateur', 'Organisateur d\'événements - peut créer et gérer des événements', '2025-11-19 17:21:14'),
(4, 'admin', 'Administrateur de la plateforme - tous les droits', '2025-11-19 17:21:14');

-- --------------------------------------------------------

--
-- Structure de la table `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `position` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `scores`
--

INSERT INTO `scores` (`id`, `event_id`, `user_id`, `score`, `position`, `notes`, `created_at`) VALUES
(1, 1, 2, 2450, 3, 'Très bonne performance en phase finale', '2025-11-19 17:21:14'),
(2, 1, 4, 2890, 1, 'Champion du tournoi - excellent gameplay', '2025-11-19 17:21:14'),
(3, 1, 5, 2670, 2, 'Vice-champion - stratégie impressionnante', '2025-11-19 17:21:14'),
(4, 2, 2, 1850, 5, 'Bon parcours général', '2025-11-19 17:21:14'),
(5, 2, 4, 2120, 4, 'Performance solide', '2025-11-19 17:21:14'),
(6, 4, 2, 3200, 1, 'Victoire dominante', '2025-11-19 17:21:14'),
(7, 5, 4, 1560, 12, 'Participation honorable', '2025-11-19 17:21:14');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `scores_details`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `scores_details` (
`id` int(11)
,`event_id` int(11)
,`user_id` int(11)
,`score` int(11)
,`position` int(11)
,`notes` text
,`created_at` timestamp
,`user_pseudo` varchar(50)
,`event_title` varchar(200)
,`event_date` datetime
);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT 2,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `pseudo`, `email`, `password`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@esportify.com', '$2y$10$hKclrBAFLwS5KtBW9mOQ4.L9aa.vf/LSv8fl.Y83.d7TdntbTgnA6', 4, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(2, 'ProGamer123', 'player@esportify.com', '$2y$10$n7KHw0nkgWb8F2FQMDO7UesYNF86VhJ6CLWeliJpP28tjthxsCRyW', 2, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(3, 'OrganizerPro', 'organizer@esportify.com', '$2y$10$9KKh/ugkdOx5S3.2wgmXbOA35x5h2Bv/KMnJ4KHqQvGGyUUWFds.q', 3, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(4, 'Player2', 'player2@esportify.com', '$2y$10$sYkEX9Er.Y9JO.seRT9X7.cBK5UVd33n6ysZtfZg3gFroQY7Amrnu', 2, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(5, 'Player3', 'player3@esportify.com', '$2y$10$uwBrY8c4lumz1JKNErGJAeEoH.DiCV4YWxi7cN0zPo57OFGjcn7MS', 2, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(6, 'OrgaTest', 'organizer2@esportify.com', '$2y$10$f8ms4qx07pzZOQVeRYXkDO.q06isxhK0LdKTsvYsmUFSqQ7rbBlxG', 3, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(7, 'PlayerTest', 'player4@esportify.com', '$2y$10$f8ms4qx07pzZOQVeRYXkDO.q06isxhK0LdKTsvYsmUFSqQ7rbBlxG', 2, '2025-11-19 17:21:14', '2025-11-19 17:21:14'),
(8, 'test', 'test@test.com', '$2y$10$fjJkogqYBHYL0nmmYxX85uXgi2FZa/zkvSKcHAvh965UZYNT8wozK', 2, '2025-11-20 10:25:58', '2025-11-20 10:25:58');

-- --------------------------------------------------------

--
-- Structure de la vue `events_with_organizer`
--
DROP TABLE IF EXISTS `events_with_organizer`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `events_with_organizer`  AS SELECT `e`.`id` AS `id`, `e`.`title` AS `title`, `e`.`description` AS `description`, `e`.`start_date` AS `start_date`, `e`.`end_date` AS `end_date`, `e`.`location` AS `location`, `e`.`max_players` AS `max_players`, `e`.`current_players` AS `current_players`, `e`.`organizer_id` AS `organizer_id`, `e`.`status` AS `status`, `e`.`is_started` AS `is_started`, `e`.`is_visible` AS `is_visible`, `e`.`created_at` AS `created_at`, `e`.`updated_at` AS `updated_at`, `u`.`pseudo` AS `organizer_pseudo`, `u`.`email` AS `organizer_email`, `r`.`name` AS `organizer_role` FROM ((`events` `e` left join `users` `u` on(`e`.`organizer_id` = `u`.`id`)) left join `roles` `r` on(`u`.`role_id` = `r`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `organizer_requests_details`
--
DROP TABLE IF EXISTS `organizer_requests_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `organizer_requests_details`  AS SELECT `o`.`id` AS `id`, `o`.`user_id` AS `user_id`, `o`.`status` AS `status`, `o`.`request_message` AS `request_message`, `o`.`admin_response` AS `admin_response`, `o`.`created_at` AS `created_at`, `o`.`reviewed_at` AS `reviewed_at`, `o`.`reviewed_by` AS `reviewed_by`, `u`.`pseudo` AS `requester_pseudo`, `u`.`email` AS `requester_email`, `a`.`pseudo` AS `reviewer_pseudo` FROM ((`organizer_requests` `o` left join `users` `u` on(`o`.`user_id` = `u`.`id`)) left join `users` `a` on(`o`.`reviewed_by` = `a`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `participations_details`
--
DROP TABLE IF EXISTS `participations_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `participations_details`  AS SELECT `p`.`id` AS `id`, `p`.`event_id` AS `event_id`, `p`.`user_id` AS `user_id`, `p`.`registration_date` AS `registration_date`, `p`.`status` AS `status`, `p`.`rejection_reason` AS `rejection_reason`, `u`.`pseudo` AS `user_pseudo`, `u`.`email` AS `user_email`, `e`.`title` AS `event_title`, `e`.`start_date` AS `event_date`, `e`.`status` AS `event_status` FROM ((`participants` `p` left join `users` `u` on(`p`.`user_id` = `u`.`id`)) left join `events` `e` on(`p`.`event_id` = `e`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `scores_details`
--
DROP TABLE IF EXISTS `scores_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `scores_details`  AS SELECT `s`.`id` AS `id`, `s`.`event_id` AS `event_id`, `s`.`user_id` AS `user_id`, `s`.`score` AS `score`, `s`.`position` AS `position`, `s`.`notes` AS `notes`, `s`.`created_at` AS `created_at`, `u`.`pseudo` AS `user_pseudo`, `e`.`title` AS `event_title`, `e`.`start_date` AS `event_date` FROM ((`scores` `s` left join `users` `u` on(`s`.`user_id` = `u`.`id`)) left join `events` `e` on(`s`.`event_id` = `e`.`id`)) ORDER BY `s`.`event_id` ASC, `s`.`position` ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index pour la table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_organizer` (`organizer_id`),
  ADD KEY `idx_is_started` (`is_started`);

--
-- Index pour la table `event_discussions`
--
ALTER TABLE `event_discussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_event` (`event_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Index pour la table `event_images`
--
ALTER TABLE `event_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event` (`event_id`),
  ADD KEY `idx_order` (`image_order`);

--
-- Index pour la table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `organizer_requests`
--
ALTER TABLE `organizer_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user` (`user_id`);

--
-- Index pour la table `participants`
--
ALTER TABLE `participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participation` (`event_id`,`user_id`),
  ADD KEY `idx_event` (`event_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event` (`event_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_position` (`position`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pseudo` (`pseudo`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_pseudo` (`pseudo`),
  ADD KEY `idx_role` (`role_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `event_discussions`
--
ALTER TABLE `event_discussions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `event_images`
--
ALTER TABLE `event_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `event_participants`
--
ALTER TABLE `event_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `organizer_requests`
--
ALTER TABLE `organizer_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `participants`
--
ALTER TABLE `participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `event_discussions`
--
ALTER TABLE `event_discussions`
  ADD CONSTRAINT `event_discussions_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_discussions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `event_images`
--
ALTER TABLE `event_images`
  ADD CONSTRAINT `event_images_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `organizer_requests`
--
ALTER TABLE `organizer_requests`
  ADD CONSTRAINT `organizer_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organizer_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `participants`
--
ALTER TABLE `participants`
  ADD CONSTRAINT `participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
