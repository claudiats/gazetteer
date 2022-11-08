<?php
	$content = file_get_contents("../json/countryBorders.geo.json");

	$json = json_decode($content);

	$countries = array();

	foreach($json -> features as $c){
		$country = new stdClass();
		$country->code = $c->properties->iso_a2;
		$country->name = $c -> properties -> name;
		array_push($countries, $country); 
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['data'] = $countries;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);


?> 
