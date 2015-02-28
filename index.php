<?php

error_reporting(E_ALL ^ E_NOTICE);

// Connection
require 'config.php';

date_default_timezone_set ( 'Europe/Athens' );
$host = $config["db_host"];
$user = $config["db_user"];
$pass = $config["db_pass"];


$db_name = "fi_db";

$dbh = new PDO("mysql:host=$host;dbname=$db_name", $user, $pass);
$dbh->exec("SET NAMES utf8");
$dbh->exec("SET time_zone = '+2:00'");

$prefix = "alt/";

$actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

$desc = "Fresh Ideas | Advertising Interior Company";
$title = "Fresh Ideas | Advertising Interior Company";
$image = "http://www.fresh-ideas.eu/$prefix"."logo.jpg";

if($_GET['w']){

	$q = $dbh->prepare('select title, (select src from images where id = s.image_id) as image_path from works s where id = :id');
	$q->execute(array(":id"=>$_GET["w"]));
	$r = $q->fetch(PDO::FETCH_ASSOC);
	$title = $r["title"];
	$image = "http://www.fresh-ideas.eu/".$r["image_path"];

}

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta content='width=device-width, initial-scale=0.5, maximum-scale=2.5, user-scalable=1' name='viewport' />
<title>Fresh Ideas</title>
<meta name="title" content="Fresh Ideas">
<meta name="description" content="<?=$desc?>">
<meta name="keywords" content="fresh ideas, patras">
<meta property="og:image" content="<?=$image?>">
<meta property="og:site_name" content="Fresh Ideas">
<meta property="og:url" content="<?=$actual_link?>">
<meta property="og:title" content="<?=$title?>">
<meta property="og:type" content="website">
<meta property="og:locale" content="el_GR">
<meta property="og:description" content="<?=$desc?>">
<script src="jquery-1.10.2.js"></script>
<script src="jquery-ui-1.10.4.min.js"></script>
<?php


$q = $dbh->prepare('select id,title,`index`,`type`,page_id,category_id from menus where isHidden != 1 and submenu_of = 0 order by `index` desc');
$q->execute();
$menuData = $q->fetchall(PDO::FETCH_ASSOC);

foreach($menuData as &$m){

$q = $dbh->prepare('select * from menus where isHidden != 1 and submenu_of = :sof order by `index`');
$q->execute(array(":sof"=>$m["id"]));
$m["submenu"] = $q->fetchall(PDO::FETCH_ASSOC);

}

$q = $dbh->prepare('select * from settings');
$q->execute();
$_settings = $q->fetchall(PDO::FETCH_ASSOC);
$settings = array();

foreach($_settings as &$m){

$settings[$m["key"]] = $m["value"];

}

$q = $dbh->prepare('select *,(select group_concat(work_id) from categories_works where category_id = categories.id order by `index`) as works from categories');
$q->execute();
$workCategories = $q->fetchall(PDO::FETCH_ASSOC);

foreach($workCategories as &$w) $w["works"] = explode(',',$w["works"]);

$q = $dbh->prepare('select * from works order by `index`');
$q->execute();
$worksData = $q->fetchall(PDO::FETCH_ASSOC);

$q = $dbh->prepare('select * from images');
$q->execute();
$images = $q->fetchall(PDO::FETCH_ASSOC);

$q = $dbh->prepare('select * from pages');
$q->execute();
$pages = $q->fetchall(PDO::FETCH_ASSOC);

$q = $dbh->prepare('select * from `clients` order by `index`');
$q->execute();
$clients = $q->fetchall(PDO::FETCH_ASSOC);
?>
<script>

var menuData = <?=json_encode($menuData)?>;
var settings = <?=json_encode($settings)?>;
var workCategories = <?=json_encode($workCategories)?>;
var worksData = <?=json_encode($worksData)?>;
var images = <?=json_encode($images)?>;
var pages = <?=json_encode($pages)?>;
var clients = <?=json_encode($clients)?>;
window._prefix = '<?=$prefix?>';
</script>
<script src="script.js"></script>
<link href="styles.css" rel="stylesheet" type="text/css" />
<link rel="shortcut icon" href="favicon.ico">
</head>
<body>

<div class="side-bg"></div>
<div class="container">

	<div class="head">
        <div class="nav-container"></div>
    	<a class="logo" href="/"></a>
    </div>
    <div class="indexContent"></div>
    <div class="copyright-date">&copy;<?=date('Y')?> fresh-ideas</div>
</div>
<div class="side-bg"></div>
<div class="preloader">
	<img scr="social.png" />
	<img scr="arrow_left_normal.png" />
	<img scr="arrow_left_hover.png" />
	<img scr="arrow_right_normal.png" />
	<img scr="arrow_right_hover.png" />
	<img scr="button_contact_active.png" />
</div>
<img src="BACK_TO_TOP.png" class="top-scroller ani05" />

<script>
var isiPad = navigator.userAgent.match(/iPad/i) != null;
var navData = '<?=json_encode($_GET)?>';
try{ navData = JSON.parse(navData); }catch(x){ navData = []; }
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 $('body').prepend('<style>.right-arrow { right: -7px !important; position: absolute !important; }.left-arrow { left: -7px !important; position: absolute !important; }</style>');
}
init();
</script>
</body>
</html>