<?php
  header('Content-type: text/html;charset=utf-8');

  $BASE_URL = "https://query.yahooapis.com/v1/public/yql";
  $TABLE_URL = "https://raw.github.com/irae/yql-tables/master/brazil/globo/globo.noticias.xml";

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
    
    // var_dump($phpObj);
    // var_dump($phpObj->query->results->result->title;);
    
    // echo $phpObj->query->results->result->title;
    
    ?><!doctype html>
    <html class="no-js no-treesaver">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,height=device-height,initial-scale=1,minimum-scale=1,maximum-scale=1">
        <title><?php echo $phpObj->query->results->result->title; ?></title>
        <link rel="resources" href="../dynamic-toc/resources.html">
        <link rel="index" href="toc.json" type="application/json">
        <link rel="stylesheet" href="../treesaver.css">
        <script src="../../lib/mustache/mustache.js"></script>
        <script src="../../lib/closure/goog/base.js"></script>
        <script src="../../test/deps.js"></script>
        <script>
          goog.require('treesaver');
        </script>
      </head>

      <body>
        <article>
          <h1><?php echo $phpObj->query->results->result->title; ?></h1>
          <?php echo $phpObj->query->results->result->body; ?>
        </article>
      </body>
    </html>

    <?php
    
  } else {
    echo 'Missing mandatory location querystring.';
  }
?>