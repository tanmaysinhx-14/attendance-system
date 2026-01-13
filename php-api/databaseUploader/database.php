<?php
  if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (str_starts_with(trim($line), '#')) continue;
      [$key, $value] = explode('=', $line, 2);
      putenv(trim($key) . '=' . trim($value));
    }
  }

  function db() {
    static $pdo;
    if (!$pdo) {
      $pdo = new PDO(
          "mysql:host=" . getEnv('DB_HOST') . ";dbname=" . getEnv('DB_NAME') . ";charset=utf8mb4",
          getEnv('DB_USER'),
          getEnv('DB_PASS'),
          [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );
    }
    return $pdo;
  }
?>