<?php
  require_once '../../config.php';
  require_once '../../db.php';
  require_once '../../jwt.php';

  header('Content-Type: application/json');

  $data = json_decode(file_get_contents('php://input'), true);

  if (!isset($data['qr_token'], $data['client_ts'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'bad_request']));
  }

  $payload = verify_jwt($data['qr_token'], JWT_SECRET);
  if (!$payload) {
    http_response_code(401);
    exit(json_encode(['error' => 'invalid_token']));
  }

  $now = time();

  if ($payload['issued_at'] > $now + MAX_CLOCK_SKEW ||
    $payload['expires_at'] < $now - MAX_CLOCK_SKEW) {
    http_response_code(410);
    exit(json_encode(['error' => 'expired']));
  }

  try {
    $stmt = db()->prepare(
      "INSERT INTO attendance_records (session_id, student_id)
      VALUES (?, ?)"
    );
    $stmt->execute([
      $payload['session_id'],
      $payload['student_id']
    ]);

    echo json_encode(['status' => 'marked']);
  } catch (PDOException $e) {
    if ($e->getCode() === '23000') {
      echo json_encode(['status' => 'already_marked']);
    } else {
      http_response_code(500);
      echo json_encode(['error' => 'server_error']);
    }
  }
