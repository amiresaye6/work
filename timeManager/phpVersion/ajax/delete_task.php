<?php
    require('../config.php');

    if (isset($_GET['task_id'])) {
        $task_id = $_GET['task_id'];
    
        if (is_numeric($task_id)) {
            $sql = "DELETE FROM timelogs WHERE id = ?";
    
            if ($stmt = $con->prepare($sql)) {
                $stmt->bind_param('i', $task_id);
    
                if ($stmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Task deleted successfully.']);
                } else {
                    // Return error response if the query failed
                    echo json_encode(['status' => 'error', 'message' => 'Failed to delete task.']);
                }
    
                // Close the statement
                $stmt->close();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Error preparing the delete query.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid task ID.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Task ID not provided.']);
    }
    
    $con->close();
?>