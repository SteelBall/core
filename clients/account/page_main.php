<?php

if (isset($request["update"]))
{
  $request["page"] = "main";
  list($g_success, $g_message) = ft_update_client($account_id, $request);
}
$client_info = ft_get_account_info($account_id);


// compile header information
$page_vars = array();
$page_vars["head_title"] = ft_eval_smarty_string($_SESSION["ft"]["account"]["settings"]["page_titles"], array("page" => $LANG["phrase_login_info"]));
$page_vars["page"]     = "main";
$page_vars["tabs"]     = $tabs;
$page_vars["client_info"] = $client_info;
$page_vars["page_url"] = ft_get_page_url("client_account");
$page_vars["head_js"] =<<< EOF
var rules = [];
rules.push("required,first_name,{$LANG["validation_no_first_name"]}");
rules.push("required,last_name,{$LANG["validation_no_last_name"]}");
rules.push("required,email,{$LANG["validation_no_email"]}");
push("required,username,{$LANG["validation_no_username"]}");
EOF;

ft_display_page("clients/account/index.tpl", $page_vars);