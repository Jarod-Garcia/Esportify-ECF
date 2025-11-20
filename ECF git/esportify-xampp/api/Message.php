<?php

class Message {
    private $collection;

    public function __construct() {

        $manager = new MongoDB\Driver\Manager("mongodb://localhost:27017");
        $this->manager = $manager;
        $this->namespace = "esportify.messages";
    }

    public function sendMessage($eventId, $userId, $pseudo, $content) {
        try {
            $bulk = new MongoDB\Driver\BulkWrite;
            
            $document = [
                'event_id' => (int)$eventId,
                'user_id' => (int)$userId,
                'pseudo' => $pseudo,
                'content' => $content,
                'created_at' => new MongoDB\BSON\UTCDateTime(),
                'is_deleted' => false
            ];
            
            $bulk->insert($document);
            
            $result = $this->manager->executeBulkWrite($this->namespace, $bulk);
            
            return [
                'success' => true,
                'message' => 'Message envoyé',
                'inserted_count' => $result->getInsertedCount()
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'envoi du message',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getMessages($eventId, $limit = 50) {
        try {
            $filter = [
                'event_id' => (int)$eventId,
                'is_deleted' => false
            ];
            
            $options = [
                'sort' => ['created_at' => 1],
                'limit' => $limit
            ];
            
            $query = new MongoDB\Driver\Query($filter, $options);
            $cursor = $this->manager->executeQuery($this->namespace, $query);
            
            $messages = [];
            foreach ($cursor as $document) {

                $message = (array)$document;

                if (isset($message['created_at'])) {
                    $message['created_at'] = $message['created_at']->toDateTime()->format('Y-m-d H:i:s');
                }

                if (isset($message['_id'])) {
                    $message['id'] = (string)$message['_id'];
                    unset($message['_id']);
                }
                
                $messages[] = $message;
            }
            
            return $messages;
            
        } catch (Exception $e) {
            return [];
        }
    }

    public function deleteMessage($messageId, $userId) {
        try {
            $bulk = new MongoDB\Driver\BulkWrite;
            
            $filter = [
                '_id' => new MongoDB\BSON\ObjectId($messageId),
                'user_id' => (int)$userId
            ];
            
            $update = [
                '$set' => ['is_deleted' => true]
            ];
            
            $bulk->update($filter, $update);
            
            $result = $this->manager->executeBulkWrite($this->namespace, $bulk);
            
            if ($result->getModifiedCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'Message supprimé'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Message non trouvé ou vous n\'êtes pas l\'auteur'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ];
        }
    }

    public function countMessages($eventId) {
        try {
            $filter = [
                'event_id' => (int)$eventId,
                'is_deleted' => false
            ];
            
            $command = new MongoDB\Driver\Command([
                'count' => 'messages',
                'query' => $filter
            ]);
            
            $cursor = $this->manager->executeCommand('esportify', $command);
            $result = $cursor->toArray()[0];
            
            return $result->n;
            
        } catch (Exception $e) {
            return 0;
        }
    }
}

?>
