<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

$sql = 'SELECT DISTINCT(municipality) AS `municipality` FROM `stations`;';

$stmt = $dbh->prepare($sql);

if ($stmt->execute()) {
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

    $data = [
        'municipalities' => $results
    ];

    $content = json_encode($data);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

echo $content;
