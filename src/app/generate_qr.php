<?php
require_once 'config.php';
require_once 'jwt.php';

$studentId = $_GET['student'];
$sessionId = $_GET['session'];

$now = time();

$payload = [
  "student_id" => $studentId,
  "session_id" => $sessionId,
  "issued_at" => $now,
  "expires_at" => $now + 180
];

echo sign_jwt($payload, JWT_SECRET);
?>