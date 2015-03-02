<?php

include 'ugly.php';

ob_start("ob_gzhandler");
header("Cache-Control: max-age=31536000");
header("Content-type: text/javascript");

$js = array();

array_push($js,file_get_contents('scripts/hammer.js'));
array_push($js,file_get_contents('scripts/mousewheel.js'));
array_push($js,file_get_contents('scripts/main.js'));
array_push($js,file_get_contents('scripts/states.js'));
array_push($js,file_get_contents('scripts/preloader.js'));
array_push($js,file_get_contents('scripts/factory.js'));

//foreach($js as &$u) $u = \JShrink\Minifier::minify($u);

echo implode(' ; ',$js);

?>