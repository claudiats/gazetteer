<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='https://restcountries.com/v3.1/alpha/' . $_REQUEST['country'];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	
    $info = array();
    $info['name'] = $decode[0]['name']['official'];
    $info['flag'] = $decode[0]['flags']['png'];
    $info['capital']['name'] = $decode[0]['capital'][0];
	$info['capital']['lat'] = $decode[0]['capitalInfo']['latlng'][0];
	$info['capital']['lng'] = $decode[0]['capitalInfo']['latlng'][1];
    $info['pop'] = $decode[0]['population'];
    $info['curr'] = array_keys($decode[0]['currencies'])[0];
	$info['currname'] = $decode[0]['currencies'][$info['curr']]['name'];
	$info['currsym'] = $decode[0]['currencies'][$info['curr']]['symbol'];
	$info['area'] = $decode[0]['area'];

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $info;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
