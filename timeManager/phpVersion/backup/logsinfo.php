<?php require_once('config.php'); ?>
<?php
    $page = "logs";
    if (!isset($_SESSION['logged'])) {
        echo "<script>window.location.href = 'login.php';</script>";
        exit;
    }

    $roles = explode(',', $_SESSION['roles']);
    if(!in_array(2, $roles)){
        echo "<script>window.location.href = 'profile.php';</script>";
        exit;
    }

    if(isset($_GET['date'])){
        if(empty($_GET['date'])){
            echo "<script>window.location.href = 'logs.php';</script>";
            exit;
        }
    }
    $currentDate = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    $previousDay = date('Y-m-d', strtotime($currentDate . ' -1 day'));
    $nextDay = date('Y-m-d', strtotime($currentDate . ' +1 day'));

    $currentDayOfWeek = date('w', strtotime($currentDate));

    $query = "
        SELECT u.email, t.log_title, t.log_hour, t.log_duration
        FROM timelogs t
        JOIN users u ON t.user_id = u.id
        WHERE t.log_day = $currentDayOfWeek
        AND t.log_year = " . date('Y') . " 
        AND t.log_week = WEEK('$currentDate')
        ORDER BY u.email, t.log_hour
    ";

    $results = $con->query($query);

    $logs = [];

    if ($results) {
        while ($row = $results->fetch_assoc()) {
            $logs[$row['email']][] = $row;
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Logs Tracker</title>
    <link rel="stylesheet" href="./css/profile_style.css">
    <style>
        table {
            width: 100%;
            table-layout: auto;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        td {
            max-width: 200px;
            text-overflow: ellipsis;
        }

        .btn {
            display: inline-block;
            padding: 5px;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s, color 0.3s;
            cursor: pointer;
        }

        .btn-previous {
            background-color: #007bff;
            color: white;
            border: 2px solid #007bff;
        }

        .btn-previous:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }

        .btn-next {
            background-color: #28a745;
            color: white;
            border: 2px solid #28a745;
        }

        .btn-next:hover {
            background-color: #218838;
            border-color: #218838;
        }

        .btn + .btn {
            margin-left: 10px;
        }

        .date-picker {
            margin-bottom: 20px;
        }
        .date-picker input {
            padding: 8px;
            font-size: 16px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <!-- Sidebar Addition -->
    <?php require_once('sidebar.php'); ?>
    
    <div>
        <h2>Employee Logs for <?php echo date('l, F j, Y', strtotime($currentDate)); ?></h2>

        <form method="GET" action="logs.php">
            <div class="date-picker">
                <label for="date">Select Date:</label>
                <input type="date" name="date" />
                <input type="submit" value="Filter" class="btn btn-previous" />
            </div>
        </form>

        <div>
            <a href="logs.php?date=<?php echo $previousDay; ?>" class="btn btn-previous">Previous Day</a>
            <a href="logs.php?date=<?php echo $nextDay; ?>" class="btn btn-next">Next Day</a>
        </div>

        <br>

        <table border="1">
            <thead>
                <tr>
                    <th>Email</th>
                    <?php 
                    $timeSlots = [
                        '8-9', '9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5', 
                        '5-6', '6-7', '7-8', '8-9', '9-10', '10-11'
                    ];
                    foreach ($timeSlots as $slot) {
                        echo "<th>$slot</th>";
                    }
                    ?>
                </tr>
            </thead>
            <tbody>
                <?php 
                foreach ($logs as $email => $userLogs) {
                    echo "<tr>";
                    $emailName = explode('@', $email)[0];
                    echo "<td>$emailName</td>";

                    // Create an array of empty strings to hold the time slots
                    $timeSlotLogs = array_fill(0, 15, null); // Use null to differentiate from empty strings

                    // Loop through each log and assign it to the correct time slot
                    foreach ($userLogs as $log) {
                        $startHour = $log['log_hour'] - 8; // Adjust hour to match the time slots (8 AM starts at index 0)
                        $duration = $log['log_duration'];

                        // Fill in the log title for each affected time slot
                        for ($i = $startHour; $i < $startHour + $duration; $i++) {
                            if ($i >= 0 && $i < 15) { // Ensure the index is within the valid range
                                $timeSlotLogs[$i] = $log['log_title'];
                            }
                        }
                    }

                    // Now display the time slots
                    $colIndex = 0; // Start index for looping through time slots
                    while ($colIndex < 15) {
                        $logTitle = $timeSlotLogs[$colIndex];

                        if ($logTitle === null) {
                            echo "<td></td>"; // No log for this time slot
                        } else {
                            // Determine how many columns this log should span
                            $colspan = 1;

                            // If the next slot has the same log, increase colspan
                            while ($colIndex + $colspan < 15 && $timeSlotLogs[$colIndex + $colspan] == $logTitle) {
                                $colspan++;
                            }

                            // Output the cell with the correct colspan
                            echo "<td colspan='$colspan'>$logTitle</td>";

                            // Skip over the columns we've just merged
                            $colIndex += $colspan - 1;
                        }
                        $colIndex++;
                    }

                    echo "</tr>";
                }
                ?>
            </tbody>
        </table>
    </div>
</body>
</html>
