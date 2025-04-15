<?php
// error_reporting(E_ALL);

// // Turn on display errors
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);

session_start();
$server = "localhost";
$user = getenv("MEDIPEX_DB_USER") ? getenv("MEDIPEX_DB_USER") : "root";
$pass = getenv("MEDIPEX_DB_PASSWORD") ? getenv("MEDIPEX_DB_PASSWORD") : "";
$db   = getenv("MEDIPEX_DB") ? getenv("MEDIPEX_DB") : "medipex";
$con = new mysqli($server, $user, $pass, $db);

?>