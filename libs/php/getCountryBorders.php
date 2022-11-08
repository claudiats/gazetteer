<?php
	$content = file_get_contents("../json/countryBorders.geo.json");

	$json = json_decode($content);

	$borders = new stdClass();

	foreach($json -> features as $c){
		if($c->properties->iso_a2 == $_REQUEST["country"]){
		 	$borders = $c;
			break;
		 }
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['data'] = $borders;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);


?> 