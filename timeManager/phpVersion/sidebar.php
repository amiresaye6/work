    <!-- Sidebar from Weekly Task Scheduler -->
    <div class="sidebar">
        <?php 
        $roles = explode(',', $_SESSION['roles']);
        if(in_array(2, $roles)): ?>
        <span>Admin</span>
        <hr>
        <a href="logs.php" class="sidebar-tab <?= $page == "logs" ? "active" : ""  ?>">
            <span>Logs</span>
        </a>
        <a href="createacc.php" class="sidebar-tab <?= $page == "createacc" ? "active" : ""  ?>">
            <span>Create Account</span>
        </a>

        <span>Employee</span>
        <hr>
        <?php endif; ?>
        <a href="profile.php" class="sidebar-tab <?= $page == "profile" ? "active" : ""  ?>">
            <span>Profile</span>
        </a>
        <a href="timetable.php" class="sidebar-tab <?= $page == "timetable" ? "active" : ""  ?>">
            <span>Timetable</span>
        </a>
        <a href="logout.php" class="sidebar-tab">
            <span>Logout</span>
        </a>
    </div>