<?php
$Host = "localhost";
$User = "root";
$Pass = "";
$DbName = "playerinfogge";

$Connection = mysqli_connect($Host, $User, $Pass, $DbName);

if (!$Connection) {
    die("Connection failed: " . mysqli_connect_error());
}

echo "Connected successfully!";
?>