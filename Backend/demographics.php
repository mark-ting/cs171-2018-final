<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

$overall_sql = <<< 'SQL'
    SELECT
        (CASE
            WHEN `gender` = '1' THEN 'male'
            WHEN `gender` = '2' THEN 'female'
            WHEN `gender` = '0' THEN 'unknown'
        END) AS `gender`, COUNT(*)
    FROM `rides`
    GROUP BY `gender`
    ORDER BY COUNT(*) DESC
SQL;

$station_sql = <<< 'SQL'
    SELECT
        (CASE
            WHEN `gender` = '1' THEN 'male'
            WHEN `gender` = '2' THEN 'female'
            WHEN `gender` = '0' THEN 'unknown'
        END) AS `gender`, COUNT(*)
    FROM `rides`
    WHERE `start_station` = ?
    GROUP BY `gender`
    ORDER BY COUNT(*) DESC
SQL;

if (!isset($_GET['station'])) {
    $sql = $overall_sql;
} else {
    $sql = $station_sql;
}

$content = '';

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
