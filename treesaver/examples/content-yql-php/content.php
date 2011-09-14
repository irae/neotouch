<?php
  $BASE_URL = "https://query.yahooapis.com/v1/public/yql";
  $TABLE_URL = "http://neotou.ch/globo.noticias.xml";

  if(isset($_GET['location'])){
    $location = $_GET['location'];

    // Form YQL query and build URI to YQL Web service
    $yql_query = 'USE "'.$TABLE_URL.'" AS globo.noticias;select * from globo.noticias where page="'.$location.'"';
    $yql_query_url = $BASE_URL . "?q=" . urlencode($yql_query) . "&format=json";

    // Make call with cURL
    $session = curl_init($yql_query_url);
    curl_setopt($session, CURLOPT_RETURNTRANSFER,true);
    $json = curl_exec($session);
    // Convert JSON to PHP object
    $phpObj =  json_decode($json);
    
    header('Content-type: text/plain;charset=utf-8');
    var_dump($phpObj);
    
  } else {
    echo 'Missing mandatory location querystring.';
  }
?>