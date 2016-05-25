<?php

	header("Access-Control-Allow-Origin:*");

	if (isset($_GET["query"])) {
		$url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" . $_GET["query"];
		$json = file_get_contents($url);
        echo $json;
	}

	if (isset($_GET["symbol"])) {
		$url = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=" . $_GET["symbol"];
		$json = file_get_contents($url);
        echo $json;
	}

	if (isset($_GET["params"])) {
		$url = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters={\"Normalized\":false,\"NumberOfDays\":1095,\"DataPeriod\":\"Day\",\"Elements\":[{\"Symbol\":\"" . $_GET["params"]. "\",\"Type\":\"price\",\"Params\":[\"ohlc\"]}]}";
		$json = file_get_contents($url);
        echo $json;
	}

    if (isset($_GET["newsQuery"])) {
	    $accountKey = '/In/xCLTbKp1doWAM5PUNNDBw2uzgG7BvsoEvtziV7A';
	    $ServiceRootURL =  'https://api.datamarket.azure.com/Bing/Search/v1/';	    
	    $WebSearchURL = $ServiceRootURL . 'News?Query=' . urlencode("'" . $_GET["newsQuery"]. "'") . '&$format=json';
	    
	    $context = stream_context_create(array(
	        'http' => array(
	            'request_fulluri' => true,
	            'header'  => "Authorization: Basic " . base64_encode($accountKey . ":" . $accountKey)
	        )
	    ));

	    $request = $WebSearchURL;
	    $response = file_get_contents($request, 0, $context);
	    echo $response;
	}
?>