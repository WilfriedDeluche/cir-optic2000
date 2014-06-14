//Angular.js app
LINKED_GUEST_GUESTCATEGORY_ID = "538f17814fba6e1aa600002d"

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
  var accessPrivileges = [
{ accesspoint_id: "5394dc6a007b3b61f300002b", name: "13/06/2014 - Vendredi - Novotel Tour Eiffel - DB", active:false, access_once: true},
{ accesspoint_id: "5394dc5fdcecc4b18d000013", name: "13/06/2014 - Vendredi - Novotel Tour Eiffel - SG", active:false, access_once: true},
{ accesspoint_id: "5394dc70dcecc4b18d000014", name: "13/06/2014 - Vendredi - Novotel Tour Eiffel - TW", active:false, access_once: true},
{ accesspoint_id: "5394dc00007b3b61f3000027", name: "14/06/2014 - Samedi - Déjeuner répétition samedi", active:false, access_once: true},
{ accesspoint_id: "5394dc06007b3b326c000035", name: "14/06/2014 - Samedi - Dîner répétition samedi", active:false, access_once: true},
{ accesspoint_id: "5394dc76dcecc4828800003d", name: "14/06/2014 - Samedi - Novotel Tour Eiffel - DB", active:false, access_once: true},
{ accesspoint_id: "5394dc7d007b3b61f300002c", name: "14/06/2014 - Samedi - Novotel Tour Eiffel - SG", active:false, access_once: true},
{ accesspoint_id: "5394dc81dcecc4828800003e", name: "14/06/2014 - Samedi - Novotel Tour Eiffel - TP", active:false, access_once: true},
{ accesspoint_id: "5394dc88007b3b61f300002d", name: "14/06/2014 - Samedi - Novotel Tour Eiffel - TW", active:false, access_once: true},
{ accesspoint_id: "5394dc0c007b3b61f3000028", name: "15/06/2014 - Dimanche - Déjeuner d'accueil dimanche", active:false, access_once: true},
{ accesspoint_id: "5394dc11007b3b61f3000029", name: "15/06/2014 - Dimanche - Déjeuner d'accueil dimanche enfant", active:false, access_once: true},
{ accesspoint_id: "5394dc17dcecc48288000033", name: "15/06/2014 - Dimanche - Dîner Paquebot", active:false, access_once: true},
{ accesspoint_id: "5394dc1bdcecc48288000034", name: "15/06/2014 - Dimanche - Dîner Paquebot enfant", active:false, access_once: true},
{ accesspoint_id: "5394dc8d007b3b61f300002e", name: "15/06/2014 - Dimanche - Novotel Tour Eiffel - DB", active:false, access_once: true},
{ accesspoint_id: "5394dc92dcecc4828800003f", name: "15/06/2014 - Dimanche - Novotel Tour Eiffel - SG", active:false, access_once: true},
{ accesspoint_id: "5394dc97007b3b61f300002f", name: "15/06/2014 - Dimanche - Novotel Tour Eiffel - TP", active:false, access_once: true},
{ accesspoint_id: "5394dc9ddcecc48288000042", name: "15/06/2014 - Dimanche - Novotel Tour Eiffel - TW", active:false, access_once: true},
{ accesspoint_id: "5394dc21007b3b326c000036", name: "16/06/2014 - Lundi - Déjeuner lundi", active:false, access_once: true},
{ accesspoint_id: "5394dc26007b3b61f300002a", name: "16/06/2014 - Lundi - Déjeuner lundi enfant", active:false, access_once: true},
{ accesspoint_id: "5394dca2dcecc48288000043", name: "16/06/2014 - Lundi - Novotel Tour Eiffel - DB", active:false, access_once: true},
{ accesspoint_id: "5394dca7007b3b61f3000030", name: "16/06/2014 - Lundi - Novotel Tour Eiffel - SG", active:false, access_once: true},
{ accesspoint_id: "5394dcacdcecc48288000044", name: "16/06/2014 - Lundi - Novotel Tour Eiffel - TP", active:false, access_once: true},
{ accesspoint_id: "5394dcb2007b3b326c000037", name: "16/06/2014 - Lundi - Novotel Tour Eiffel - TW", active:false, access_once: true},
{ accesspoint_id: "5394dcbf007b3b326c000038", name: "Assemblée Générale", active:false, access_once: true},
{ accesspoint_id: "538c7d85f47d4789c0000032", name: "Entrée", active:false, access_once: true},
{ accesspoint_id: "5394dcc7007b3b326c000039", name: "congres", active:false, access_once: true}
];
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
  if (httpMethod != "POST") {
    mainCategoryFormAction = formAction; //Don't use json PUT here, it does not work in production
    var redirectPath = angular.element("#url_back").val();
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
        if (redirectPath == undefined) {
          var redirectPath = data.confirmation_url;
        }
        window.location = redirectPath;
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