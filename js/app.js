
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
    {name: "Déjeuner lundi", accesspoint_id: "5391b394881b5a862f00001b", active: 0 , access_once: true},
    {name: "Dîner paquebot", accesspoint_id: "5391b398881b5a862f000023", active: 0, access_once: true}
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

module.controller("FormController", function($scope, $http) {
  var mainCategoryFormAction = angular.element("form").attr("action") + ".json";
  var methodElement = angular.element("input[name=_method]");
  $scope.creationMode = true;
  var httpMethod = "POST";
  if (methodElement != undefined && methodElement.length > 0) {
    httpMethod = methodElement.attr("value");
  }
  
  var authenticityToken = angular.element("input[name=authenticity_token]").attr("value");
  $scope.linkedGuests = [];
  if (window.GUEST != undefined) {
    $scope.mainGuest = GUEST;
    handleExistingMetadata($scope.mainGuest);
    $scope.creationMode = false;    
  } else {
    $scope.mainGuest = {};
  }
  initAccessPrivileges($scope.mainGuest);

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
      if ($scope.creationMode)
        return;

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
          }
        }    
      );
    });
    promise.error(function(data, status, headers, config) {
      alert("Erreur, veuillez recommencer svp ...");
    });
  };
});