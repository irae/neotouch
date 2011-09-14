<?php
  require('config.php');

    // Form YQL query and build URI to YQL Web service

    $yql_query = 'select * from feed where url="'.$RSS_URL.'"';
    $yql_query_url = $BASE_URL . "?q=" . urlencode($yql_query) . "&format=json";

    // Make call with cURL
    $session = curl_init($yql_query_url);
    curl_setopt($session, CURLOPT_RETURNTRANSFER,true);
    $json = curl_exec($session);
    // Convert JSON to PHP object
    $phpObj =  json_decode($json);
    
?>{
  "contents": [
    {
      "url": "index.html",
      "type": "none"
    },

  <?php

  $i = 0;
  $total=count($phpObj->query->results->item)-1;
  foreach($phpObj->query->results->item as $item) :
  ?>
  
  {
    "url": "<?php echo $ARTICLE_BASE_URL; ?>?location=<?php echo $item->link; ?>",
    "title": "<?php echo str_replace(array("\n","\r"),"\\n", addcslashes($item->title,'"')); ?>",
    "type": "world-news",
    "publication": {
      "time": "<?php echo $item->pubDate; ?>",
      "name": "G1 Ciência e Saúde"
    }
  }<?php

  if($i != $total ) {
    echo ',';
  }

  $i = $i + 1;

  endforeach;
?>

  ]
}
