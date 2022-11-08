<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

    include("config.php");

    $data = http_build_query(array(
        "api_key" => $_festivo,
        "country" => $_REQUEST['country'],
        "year" => $_REQUEST['year'],
      ));

	$url='https://api.getfestivo.com/v2/holidays?' . $data;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);
    $decode = json_decode($result,true);	 
	curl_close($ch);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['holidays'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($decode); 

?>