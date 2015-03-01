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

$ROOT = "/b/site/";

$actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

$desc = "Fresh Ideas | Advertising Interior Company";
$title = "Fresh Ideas | Advertising Interior Company";
$image = "http://fresh-ideas.eu$ROOT"."images/logo.jpg";

$uri = explode('?',$_SERVER["REQUEST_URI"]);
$uri = explode('/',$uri[0]);

$q = $dbh->prepare('select group_concat(alias) as aliases from pages');
$q->execute();
$pageAliases = $q->fetch(PDO::FETCH_ASSOC);
$pageAliases = explode(',',$pageAliases["aliases"]);

foreach($uri as &$dir){

  if(!$dir) continue;
  if($directive) $anchor = $dir;
  $page = array_search($dir,$pageAliases);
  if($page || $page == 0) break;
  $directive = array_search($dir,array(
    "works"    => "works",
    "clients"  => "clients",
    "category" => "category"
  ));

}

if(($directive && $anchor) || !is_nan($page)){

  if($directive == "works")    $query = 'select title, (select src from images where id = s.image_id) as image_path from works s where alias = :alias';
  if($directive == "clients")  $query = 'select title, (select src from images where id = s.image_id) as image_path from clients s where alias = :alias';
  if($directive == "category") $query = 'select title from categories s where alias = :alias';

	$q = $dbh->prepare($query);
	$q->execute(array(":alias"=>$anchor));
	$r = $q->fetch(PDO::FETCH_ASSOC);

	$title = $r["title"] . " | Fresh Ideas";

	is_nan($page) && !$directive == "category" && $image = "http://www.fresh-ideas.eu".$r["image_path"];

}

if($directive && !$anchor) $title = "Clients | Fresh Ideas";

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta content='width=device-width, initial-scale=0.5, maximum-scale=2.5, user-scalable=1' name='viewport' />
<title>Fresh Ideas | Advertising Interior Company</title>
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

  var siteData = {
    menu: <?=json_encode($menuData)?>,
    settings: <?=json_encode($settings)?>,
    categories: <?=json_encode($workCategories)?>,
    works: <?=json_encode($worksData)?>,
    images: <?=json_encode($images)?>,
    pages: <?=json_encode($pages)?>,
    clients: <?=json_encode($clients)?>
  }

  var ROOT = '<?=$ROOT?>';

</script>
<link href="<?=$ROOT?>styles.css" rel="stylesheet" type="text/css" />
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="<?=$ROOT?>jsbinder.php"></script>
<link rel="shortcut icon" href="<?=$ROOT?>images/favicon.ico">
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
<img src="<?=$ROOT?>images/back_to_top.png" class="top-scroller ani05" />

<script>
var isiPad = navigator.userAgent.match(/iPad/i) != null;
var navData = '<?=json_encode($_GET)?>';
try{ navData = JSON.parse(navData); }catch(x){ navData = []; }
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 $('body').prepend('<style>.right-arrow { right: -7px !important; position: absolute !important; }.left-arrow { left: -7px !important; position: absolute !important; }</style>');
}
  var Site = new OnePage(window);
</script>
</body>
</html>