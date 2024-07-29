<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tasks = file_get_contents('tasks.json');
    echo $tasks;
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if(isset($data['task']) && !empty($data['task']['text'])) {
        $tasks = json_decode(file_get_contents('tasks.json'), true);

        $newTask = [
            'id' => $data['task']['id'],
            'text' => $data['task']['text'],
            'completed' => $data['task']['completed'],
            'description' => $data['task']['description'] ?? '' // Aggiunta della descrizione
        ];

        $tasks[] = $newTask;
        file_put_contents('tasks.json', json_encode($tasks, JSON_PRETTY_PRINT));

        $response = [
            'status' => 'success',
            'message' => 'Task Added',
            'task' => $newTask
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Invalid input'
        ];
    }
    echo json_encode($response);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if(isset($data['id']) && (isset($data['completed']) || isset($data['text']) || isset($data['description'])))  {
        $tasks = json_decode(file_get_contents('tasks.json'), true);
        foreach ($tasks as &$task) {
            if ($task['id'] == $data['id']) {
                if (isset($data['completed'])) $task['completed'] = $data['completed'];
                if (isset($data['text'])) $task['text'] = $data['text'];
                if (isset($data['description'])) $task['description'] = $data['description'];
                break;
            }
        }
        file_put_contents('tasks.json', json_encode($tasks, JSON_PRETTY_PRINT));
        $response = [
            'status' => 'success',
            'message' => 'Task updated',
            'id' => $data['id'],
            'completed' => $data['completed'] ?? null,
            'text' => $data['text'] ?? null,
            'description' => $data['description'] ?? null
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Invalid input'
        ];
    }
    echo json_encode($response);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if(isset($data['id'])) {
        $tasks = json_decode(file_get_contents('tasks.json'), true);
        $tasks = array_filter($tasks, function($task) use ($data) {
            return $task['id'] != $data['id'];
        });
        file_put_contents('tasks.json', json_encode(array_values($tasks), JSON_PRETTY_PRINT));
        $response = [
            'status' => 'success',
            'message' => 'Task deleted',
            'id' => $data['id']
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Invalid input'
        ];
    }
    echo json_encode($response);
}

?>