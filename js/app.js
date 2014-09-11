//Angular.js app
LINKED_GUEST_GUESTCATEGORY_ID = "53f3489d847588c3e2000363"

//Mandatory for using angular template inside liquid templates
var module = angular.module('myApp', []).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  }
);

var handleError  = function(error){
  linkedGuestError = error.linkedGuest;

};

//This method makes sure that for an existing guest, access privileges are enriched using non active ones
//And initializes access privileges for new guests
var initAccessPrivileges = function(object) {
  //List of accesspoint must be here
  var accessPrivileges = privileges;
  var currentPrivileges = []
  if (object.access_privileges && object.access_privileges.length > 0 )
    angular.copy(object.access_privileges, currentPrivileges);
  object.access_privileges = [];
  angular.copy(accessPrivileges, object.access_privileges);
  if (currentPrivileges && currentPrivileges.length > 0) {
    object.access_privileges.forEach (function(accessPrivilege) {
      currentPrivileges.forEach(function (ap) {
        if (ap.accesspoint_id == accessPrivilege.accesspoint_id) {
          accessPrivilege.active = true;
        }
      });
    });
  }
}

var filterUnactiveAccessPrivileges = function(object) {
  attributes = []
  object.access_privileges.forEach (function(value) {
    if(value.active == true) {
      attributes.push(value);
    }
  });
  if (attributes.length > 0)
    object.access_privileges_attributes = attributes;
  else
    delete object.access_privileges_attributes ;
}

var handleExistingMetadata = function(object) {
  var existingMetadata =  angular.copy(object.guest_metadata);
  object.guest_metadata = {};
  existingMetadata.forEach(function(metadatum) {
    object.guest_metadata[metadatum.name] = metadatum.value;
  });
}

function urlParams(name) {
    // var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
//     return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  var queryDict = {}
  location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
  return queryDict;
}

function fillLinkedGuestFromParams(scope, params) {
  var linkedGuests = [];
  for (var i = 2; i < 5; i+= 1) {
    if (params["contact" + i + "_nom"] != undefined && params["contact" + i + "_nom"].length != 0 ) {
      var lg = {last_name: params["contact" + i + "_nom"]};
      if (params["contact" + i + "_prenom"] != undefined) {
        lg.first_name = params["contact" + i + "_prenom"];
      }
      initAccessPrivileges(lg);
      linkedGuests.push(lg);
    }
  }
  return linkedGuests;
}

function swapFields(guest, field1, field2) {
  var previsouField1 = guest[field1];
  guest[field1] = guest[field2];
  guest[field2] = previsouField1;
}

module.controller("FormController",function($scope, $http, $location) {

  //Configure global behaviour
  var formAction = angular.element("form").attr("action");
  var mainCategoryFormAction = formAction + ".json";
  var methodElement = angular.element("input[name=_method]");
  $scope.creationMode = true;

  var httpMethod = "POST";
  if (methodElement != undefined && methodElement.length > 0) {
    httpMethod = methodElement.attr("value");
  }
  $scope.redirPath = null;
  if (httpMethod != "POST") {
    $scope.redirPath = angular.element("#url_back").val();
    $scope.creationMode = false;
  }
  var authenticityToken = angular.element("input[name=authenticity_token]").attr("value");

  //Configure mainGuest
  if (window.GUEST != undefined) {
    $scope.mainGuest = GUEST;
    handleExistingMetadata($scope.mainGuest);
  } else {
    $scope.mainGuest = {};
  }

  //Pre-fill mainGuest
  var params = urlParams();
  for (key in params) {
    $scope.mainGuest[key] = params[key];
  }
  initAccessPrivileges($scope.mainGuest);

  $scope.linkedGuests = [];

  if ($scope.creationMode) {
    //fill in from params
    $scope.linkedGuests = fillLinkedGuestFromParams($scope, params);
    //fill in from existing guest. Will be triggered for receiver, and not in update mode since we are in creation mode
    if ($scope.mainGuest.guest_metadata != undefined)
      $scope.linkedGuests = fillLinkedGuestFromParams($scope, $scope.mainGuest.guest_metadata);
  }

  $scope.addLinkedGuest = function() {
    var linkedGuest = {}
    initAccessPrivileges(linkedGuest);
    $scope.linkedGuests.push(linkedGuest);
  };

  $scope.removeLinkedguest = function(rank) {
    $scope.linkedGuests.splice(rank, 1);
  };

  $scope.save = function() {

    //1. First save the main guest
    filterUnactiveAccessPrivileges($scope.mainGuest);
    var promise = $http({method: httpMethod, url: mainCategoryFormAction, data: { guest: $scope.mainGuest, authenticity_token: authenticityToken}})
    promise.success(function(data, status, headers, config) {
      var redirectToPage = function() {
        if ($scope.redirPath == null) {
          $scope.redirPath = data.confirmation_url;
        }
        window.location = $scope.redirPath;
      };
      if ($scope.creationMode == false) {
        redirectToPage();
        return;
      }

      //2. Then save the linked guests
      async.each($scope.linkedGuests,
        function(linkedGuest, cbs){
          filterUnactiveAccessPrivileges(linkedGuest);
          var pathTokens = mainCategoryFormAction.split("/");
          pathTokens[pathTokens.length - 2] = LINKED_GUEST_GUESTCATEGORY_ID;
          var newPath = pathTokens.join("/");
          var linkedGuestPromise = $http({method: "POST", url: newPath, data: {guest: linkedGuest, authenticity_token: authenticityToken}})
          linkedGuestPromise.success(function(data, status, headers, config) {
            cbs();
          });
          linkedGuestPromise.error(function(data, status, headers, config) {
            cbs({err:"Error", linkedGuest: linkedGuest, errors: data});
          });
        },
        function(err) {
          if (err) {
            handleError(err);
          } else {
            redirectToPage();
          }
        }
      );
    });
    promise.error(function(data, status, headers, config) {
      alert("Erreur, veuillez recommencer svp ...");
    });
  };
});
