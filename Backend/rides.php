<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

$start_date = $_GET['start'];
$end_date = $_GET['end'];
$region = $_GET['region'];

$sql = 'SELECT * FROM `rides` WHERE `start_time` >= ? AND `end_time` <= ? LIMIT 100;';

$stmt = $dbh->prepare($sql);

if ($stmt->execute([$start_date, $end_date])) {
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [
        'rides' => $results,
        'range' => [$start_date, $end_date]
    ];

    $content = json_encode($data);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

echo $content;