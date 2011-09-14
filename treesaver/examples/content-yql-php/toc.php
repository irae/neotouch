<?php
  $BASE_URL = "https://query.yahooapis.com/v1/public/yql";
  $TABLE_URL = "https://raw.github.com/irae/yql-tables/master/brazil/globo/globo.noticias.xml";

  if(isset($_GET['location'])){
    $location = $_GET['location'];

    // Form YQL query and build URI to YQL Web service

    $yql_query = 'select * from feed where url="'.$location.'"';
    $yql_query_url = $BASE_URL . "?q=" . urlencode($yql_query) . "&format=json";

    // Make call with cURL
    $session = curl_init($yql_query_url);
    curl_setopt($session, CURLOPT_RETURNTRANSFER,true);
    $json = curl_exec($session);
    // Convert JSON to PHP object
    $phpObj =  json_decode($json);
    
    header('Content-type: text/plain;charset=utf-8');
	 //   var_dump($phpObj);
	 // die();
	
	?>
		
	{
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
	      "url": "/treesaver/examples/content-yql-php/content.php?location=<?php echo $item->link; ?>",
	      "title": "<?php echo str_replace(array("\n","\r"),"\\n", addcslashes($item->title,'"')); ?>",
	      "type": "world-news",
	      "publication": {

	        "time": "<?php echo $item->pubDate; ?>",

	        "name": "G1 Ciência e Saúde"
	      }
	    }
	<?php
	if($i != $total ) {
		echo ',';
	}
	$i = $i + 1;
	endforeach;

	?>

	  ]
	}

	<?php

  } else {
    echo 'Missing mandatory location querystring.';
  }
//	       "time": "<?php echo date("Y-m-d", date_create_from_format("D, m M Y H:i:s T", $item->pubDate));"
?>

