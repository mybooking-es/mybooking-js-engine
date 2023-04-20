require(['jquery', 'commonSettings', 'customCookie'],
         function($, commonSettings, customCookie) {

  // Extract the agent
  var urlVars = commonSettings.getUrlVars();
  var agentId = null;  
  if (typeof urlVars['agentId'] != 'undefined') {
    agentId = decodeURIComponent(urlVars['agentId']);
    customCookie.set('__mb_agent_id', agentId, {expires: 14});      
  }
  else if (typeof urlVars['agentID'] != 'undefined') {
    agentId = decodeURIComponent(urlVars['agentID']);
    customCookie.set('__mb_agent_id', agentId, {expires: 14}); 
  }

});