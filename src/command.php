<?php
$command = filter_input(INPUT_POST,"cmd");
# http://yokano-jp.blogspot.jp/2015/04/php-shellexec.html
# http://hasami-yoshibo.hatenablog.com/entry/2013/05/01/210045
if($command){
	$output = shell_exec("export LANG=ja_JP.UTF-8;$command");
}
 header('Content-Type: application/json; charset=utf-8');
 echo json_encode($output,JSON_UNESCAPED_UNICODE);
?>
