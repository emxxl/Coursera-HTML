(function (global) {
  var ajaxUtils = {};

  function getRequestObject() {
    if (global.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else {
      global.alert("Ajax is not supported!");
      return null;
    }
  }

  ajaxUtils.sendGetRequest = function (requestUrl, responseHandler, isJsonResponse) {
    var request = getRequestObject();
    request.onreadystatechange = function () {
      if ((request.readyState == 4) && (request.status == 200)) {
        if (isJsonResponse == undefined) { isJsonResponse = true; }
        if (isJsonResponse) {
          responseHandler(JSON.parse(request.responseText));
        } else {
          responseHandler(request.responseText);
        }
      }
    };
    request.open("GET", requestUrl, true);
    request.send(null);
  };

  global.$ajaxUtils = ajaxUtils;
})(window);