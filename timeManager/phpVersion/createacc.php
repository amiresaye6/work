<?php require_once('config.php'); ?>
<?php
    $page = "createacc";
    if (!isset($_SESSION['logged'])) {
        echo "<script>window.location.href = 'login.php';</script>";
        exit;
    }

    $roles = explode(',', $_SESSION['roles']);
    if(!in_array(2, $roles)){
        echo "<script>window.location.href = 'profile.php';</script>";
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $password = $_POST['password'];

        if (empty($email) || empty($phone) || empty($password)) {
            $error = "All fields are required!";
        } else {
            $query = "SELECT * FROM users where email = '$email' ";
            $result = $con->query($query);
            if ($result->num_rows > 0) {
                $error = "Email Exist, Please Change Email!";
            }else{
                $salt2 = substr($email, -2, 2) . strlen($email);
                $hashedPassword = md5($password) . $salt2;
                $query = "INSERT INTO users (email, phone, password) VALUES (?, ?, ?)";
                $stmt = $con->prepare($query);
                $stmt->bind_param('sss', $email, $phone, $hashedPassword);
    
                if ($stmt->execute()) {
                    $userId = $stmt->insert_id;
    
                    $roleId = 3;
                    $roleQuery = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
                    $roleStmt = $con->prepare($roleQuery);
                    $roleStmt->bind_param('ii', $userId, $roleId);
    
                    if ($roleStmt->execute()) {
                        $successMessage = "User created successfully!";
                    } else {
                        $error = "Failed to assign role.";
                    }
                } else {
                    $error = "Failed to create user.";
                }
            }
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create User</title>
    <link rel="stylesheet" href="./css/profile_style.css">
    <style>
        .form-container {
            width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        input {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        .btn {
            width: 100%;
            padding: 10px;
            background-color: #28a745;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .btn:hover {
            background-color: #218838;
        }

        .message {
            padding: 10px;
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            margin-bottom: 10px;
        }

        .success-message {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
    </style>
</head>
<body>
    <!-- Sidebar Addition -->
    <?php require_once('sidebar.php'); ?>

    <div class="form-container">
        <h2>Create New User</h2>

        <?php if (isset($error)) { ?>
            <div class="message"><?php echo $error; ?></div>
        <?php } ?>

        <?php if (isset($successMessage)) { ?>
            <div class="message success-message"><?php echo $successMessage; ?></div>
        <?php } ?>

        <form method="POST" action="createacc.php">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required placeholder="Enter email">

            <label for="phone">Phone Number</label>
            <input type="text" name="phone" id="phone" required placeholder="Enter phone number">

            <label for="password">Password</label>
            <input type="password" name="password" id="password" required placeholder="Enter password">

            <button type="submit" class="btn">Create Account</button>
        </form>
    </div>
</body>
</html>
