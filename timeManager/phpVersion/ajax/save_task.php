<?php
    require('../config.php');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user_id = $_POST['user_id'];

        $title = $_POST['title'];
        $day = $_POST['day'];
        $hour = $_POST['hour'];
        $week = $_POST['week'];
        $year = $_POST['year'];
        $duration = $_POST['duration'];
        $color = $_POST['color'];
    
        $sql = "INSERT INTO timelogs (user_id, log_title, log_day, log_hour, log_week, log_year, log_duration, log_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $con->prepare($sql);
        $stmt->bind_param('isiiiiss', $user_id, $title, $day, $hour, $week, $year, $duration, $color);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Task saved successfully!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save task.']);
        }

        $stmt->close();
        $con->close();

    }
?>