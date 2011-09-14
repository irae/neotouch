<?php

if(isset($_GET['location'])){
  $location = $_GET['location'];

  // Form YQL query and build URI to YQL Web service
  $yql_query = 'USE "'.$TABLE_URL.'" AS '.$TABLE_NAME.';select * from '.$TABLE_NAME.' where page="'.$location.'"';

  $yql_query_url = $BASE_URL . "?q=" . urlencode($yql_query) . "&format=json";

  // Make call with cURL
  $session = curl_init($yql_query_url);
  curl_setopt($session, CURLOPT_RETURNTRANSFER,true);
  $json = curl_exec($session);
  // Convert JSON to PHP object
  $phpObj =  json_decode($json);
  
  require('head.php');
  ?>
    <article>
      <h1><?php echo $phpObj->query->results->result->title; ?></h1>
      <?php echo $phpObj->query->results->result->body; ?>
    </article>
  <?php
  
} else {
  echo 'Missing mandatory location querystring.';
}

?>