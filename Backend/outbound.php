<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

if (!isset($_GET['station'])) {
    return;
}

$content = '';

$sql = <<< 'SQL'
    SELECT `end_station`, COUNT(1)
    FROM `rides`
    WHERE `start_station` = ?
    GROUP BY `end_station`
SQL;

$stmt = $dbh->prepare($sql);

$station = $_GET['station'];
if ($stmt->execute([$station])) {
    $results = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    $data = $results;
    $content = json_encode($data);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo $content;
