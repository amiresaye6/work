<?php require_once('config.php'); ?>
<?php
    $page = "profile";
    if (!isset($_SESSION['logged'])) {
        echo "<script>window.location.href = 'login.php';</script>";
        exit;
    }

    $today = date('Y-m-d');
    $user_id = $_SESSION['logged'];
    $checkedin = false;

    $sql = "SELECT timestamp FROM checks WHERE type = 'in' AND user_id = '$user_id' AND DATE(timestamp) = '$today'";

    $result = $con->query($sql);

    if ($result->num_rows > 0) {
        $checkedin = true;

        $row = $result->fetch_assoc();
        $timestamp = $row['timestamp'];
        
        $formattedTime = date('h:i A', strtotime($timestamp));

    } else {
        $checkedin = false;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        if(isset($_POST['checkin'])){
            $sql = "INSERT INTO checks (user_id, type) VALUES ('$user_id', 'in')";
            $con->query($sql);
        
            echo "<script>alert('Checked In Successfully!');</script>";
            echo "<script>window.location.href = 'profile.php';</script>";
            exit;
        }
    }
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile Page</title>
    <link rel="stylesheet" href="./css/profile_style.css">
</head>

<body>
    <?php require_once('sidebar.php'); ?>

    <div class="container">
        <main>
            <!-- Profile Card -->
            <section class="profile-card">
                <div class="profile-header">
                    <div class="avatar-container">
                        <img class="avatar-placeholder" src="./images/profiles/1/user.jpg"></img>
                    </div>
                    <!-- <h2 class="user-name">Amir Alsayed</h2> -->
                    <!-- <p class="user-role">Full-Stack Developer</p> -->
                </div>

                <div class="profile-body">
                    <div class="info-section">
                        <h3>Contact Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Email Address</div>
                                <!-- <div class="info-value">amiralsayed.work@gmail.com</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Mobile Phone</div>
                                <!-- <div class="info-value">+201555127543</div> -->
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3>Employment Details</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Employee ID</div>
                                <!-- <div class="info-value">EMP-1001</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Department</div>
                                <!-- <div class="info-value">Web</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Location</div>
                                <!-- <div class="info-value">Sharqia, Egypt</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Date Joined</div>
                                <!-- <div class="info-value">March 1, 2024</div> -->
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3>Additional Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Team</div>
                                <!-- <div class="info-value">Omniflow Development</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Manager</div>
                                <!-- <div class="info-value">Not applicable (Self-managed/Freelancer)</div> -->
                            </div>
                            <div class="info-item">
                                <div class="info-label">Working Hours</div>
                                <!-- <div class="info-value">10:00 AM - 2:00 PM (EET)</div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Shift Control -->
             <form action="profile.php" method="POST">
                <section class="shift-control">
                    <?php if(!$checkedin): ?>
                    <button type="submit" name="checkin" id="start-shift-btn" class="shift-button">
                        <i>⏱️</i> Start Shift
                    </button>
                    <?php else: ?>
                    <div class="shift-info">
                        <div id="shift-timestamp" class="shift-timestamp">
                            Shift started at: <span id="timestamp-value"><?= $formattedTime ?></span>
                        </div>
                    </div>
                    <?php endif; ?>
                </section>
             </form>

        </main>
    </div>

    <script src="./js/profile_script.js"></script>
</body>

</html>