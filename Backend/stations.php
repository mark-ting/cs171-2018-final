<?php
$include = dirname($_SERVER['DOCUMENT_ROOT']) . '/include/';
require_once "$include/db_config.php";

$content = '';

if ($_GET['station']) {
    $id = $_GET['station'];

    $sql = 'SELECT * FROM `stations` WHERE `id` = ?;';
    $stmt = $dbh->prepare($sql);

    if ($stmt->execute([$id])) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $data = [
            'station' => $result
        ];

        $content = json_encode($data);
    }
} else {
    $sql = 'SELECT * FROM `stations`;';
    $stmt = $dbh->prepare($sql);

    if ($stmt->execute()) {
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = [
            'stations' => $results
        ];

        $content = json_encode($data);
    }
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

echo $content;
