<?php // ENV Loader Script
  if (file_exists('./credentials.env')) {
    $lines = file('./credentials.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (str_starts_with(trim($line), '#')) continue;
      [$key, $value] = explode('=', $line, 2);
      putenv(trim($key) . '=' . trim($value));
    }
  }
?>

<?php // Backend for QR Token Decryption
  define('MAX_CLOCK_SKEW', 30);

  function decryptData($encryptedData, $secretKey) {
    $cipher = "AES-256-CBC";
    $urlSafeData = strtr($encryptedData, '-_', '+/'); 

    $padding = strlen($urlSafeData) % 4;
    if ($padding) {
      $urlSafeData .= str_repeat('=', 4 - $padding);
    }

    $decodedData = base64_decode($urlSafeData);

    if ($decodedData === false || strlen($decodedData) < 17) {
      return false;
    }

    $iv = substr($decodedData, 0, 16);
    $cipherText = substr($decodedData, 16);

    $decryptedData = openssl_decrypt($cipherText, $cipher, $secretKey, OPENSSL_RAW_DATA, $iv);

    return $decryptedData;
  }

  function b64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  function b64url_decode($data) {
    $data = strtr($data, '-_', '+/');
    return base64_decode($data . str_repeat('=', 3 - (3 + strlen($data)) % 4));
  }

  function verify_jwt($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return false;
    }

    [$h64, $p64, $signature] = $parts;

    $header = json_decode(b64url_decode($h64), true);
    $payload = json_decode(b64url_decode($p64), true);

    if (($header['alg'] ?? null) !== 'HS256') {
      http_response_code(403);
      return false;
    }

    $expected = b64url_encode(hash_hmac('sha256', "$h64.$p64", $secret, true));

    if (!hash_equals($expected, $signature)) {
      http_response_code(403);
      return false;
    }

    return $payload;
  }
?>

<?php
  require_once './database.php'; $db = connectToDB();

  header('Content-Type: application/json');

  $data = json_decode(file_get_contents("php://input"), true);

  if ($data) { // Check presence of POST data
    $encryptedScanner = $data["encryptedScanner"] ?? null;
    $qrToken = $data["qrToken"] ?? null;

    if ($encryptedScanner && $qrToken) { // Check Presence of Encrypted Student Usercode and QR Token

      if (decryptData($encryptedScanner, getenv('QR_ENCRYPTION_KEY')) === true) {
        $payload = verify_jwt($qrToken, getenv('JWT_SECRET'));

        if ($payload) {
          $issued  = $payload['issued_at'] ?? null;
          $expires = $payload['expires_at'] ?? null;

          $now = time();
          if ($now >= $issued - MAX_CLOCK_SKEW && $now <= $expires + MAX_CLOCK_SKEW) {
            $STMT_insertAttendanceRecord = "INSERT INTO attendance_records (student_usercode, student_attendanceIssueDate) 
                                            VALUES (:student_usercode, :current_dateStamp)";
            $insertAttendanceRecord = $db->prepare($STMT_insertAttendanceRecord);
            $insertAttendanceRecord->bindValue(':student_usercode', $scanner, PDO::PARAM_STR);
            $insertAttendanceRecord->bindValue(':current_dateStamp', date('Y-m-d'), PDO::PARAM_STR);

            try {
              if ($insertAttendanceRecord->execute()) {
                echo json_encode([
                  "success" => true,
                  "message" => "Attendance recorded successfully."
                ]);
              }
              exit;
            } 
            catch (Exception $e) {
              if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode([
                  "success" => false,
                  "message" => "Attendance already recorded for today."
                ]);

                exit;
              } 
              else { // Hide these errors. Might contain PDO errors.
                http_response_code(500);
                echo json_encode([
                  "success" => false,
                  "error" => "An unexpected error occurred."
                ]);
                exit;
              }
            }
          }
          else { // Expired QR Code
            http_response_code(403);
            echo json_encode([
              "success" => false,
              "error" => "QR Code is expired."
            ]);
            exit;
          }
        }
        else { // Error with Verify JWT Function
          http_response_code(403);
          echo json_encode([
            "success" => false,
            "error" => "Something unexpected occured. Contact Admin."
          ]);
          exit;
        }
      }
      else { // Encrypted Student Usercode is invalid
        http_response_code(400);
        echo json_encode([
          "success" => false,
          "error" => "Invalid Encrypted Student Usercode."
        ]);
        exit;
      }
    }
    else { // Student Usercode or QR Token is invalid
      http_response_code(400);
      echo json_encode([
        "success" => false,
        "error" => "Invalid Request created. Missing Required Data."
      ]);
      exit;
    }
  }
  else { // Error with POST Data
    http_response_code(400);
    echo json_encode([
      "success" => false,
      "error" => "Invalid Request created."
    ]);
    exit;
  }
?>