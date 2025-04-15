<?php
    require('../config.php');

    if (isset($_GET['week_start'])) {
        $week_start = $_GET['week_start'];
        $user_id = $_GET['user_id'];

        $week_start_date = new DateTime($week_start);
        $week_number = $week_start_date->format("W");
        $year = $week_start_date->format("Y");
    
        $sql = "SELECT * FROM timelogs WHERE log_week = ? AND log_year = ? AND user_id = ?";
        $stmt = $con->prepare($sql);
        $stmt->bind_param('ssi', $week_number, $year, $user_id);
    
        // Execute the query
        $stmt->execute();
    
        // Fetch tasks
        $tasks = $stmt->get_result();
    
        $formatted_tasks = [];
    
        // Store the results in an array
        while ($task = $tasks->fetch_assoc()) {
            $formatted_tasks[] = [
                'id' => $task['id'],
                'title' => $task['log_title'], 
                'description' => $task['log_description'],
                'color' => $task['log_color'],
                'day' => $task['log_day'],
                'hour' => $task['log_hour'],
                'duration' => $task['log_duration'],
                'created' => $task['log_created']
            ];
        }
    
        // Return tasks as JSON
        echo json_encode($formatted_tasks);
    
        // Close the statement and connection
        $stmt->close();
    }

    $con->close();
?>