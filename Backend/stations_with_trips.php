<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

$sql = <<< 'SQL'
    SELECT * FROM `stations`
    WHERE `id` IN
        (
        SELECT DISTINCT(`start_station`) FROM `rides`
        -- Note: this optimization works for the 2015 data sets,
        -- as trips are a closed graph
        --     UNION
        -- SELECT DISTINCT(`end_station`) FROM `rides`
        )
SQL;

$stmt = $dbh->prepare($sql);

if ($stmt->execute()) {
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result_base = [
        'stations' => $results
    ];

    $content = json_encode($result_base);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

echo $content;
