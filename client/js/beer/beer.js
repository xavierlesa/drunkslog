define(['../resources'], function() {
	
	var beer = angular.module("dl.beer", ["dl.resources"]);

	beer.controller("BeerController", function($scope, Beer, $translate, DLHelper) {
		//$scope.beers = Beer.query();

		function sortScore(beer) {
        	if ( beer.score ) {
        		return beer.score.avg || 0;	
        	}
        	return 0;
        }

        $scope.dataHelper = {
        	getMyScore: function(beer_id) {
        		var sum = 0;
        		var count = 0;
        		if ( !$scope.user ) return '-';
        		angular.forEach($scope.user.ratings, function(r) {
        			if ( r.beer == beer_id ) {
        				angular.forEach(r.finalScore, function(s) {
        					sum += s;
        					count++;
        				});
        			}
        		});
        		if ( count != 0 ) {
        			return sum/count;
        		} else {
        			return '-';
        		}
        	}
        };

		$scope.config = {
            data: Beer,
            name: $translate('beer.data.beer'),
            singular: $translate('beer.data.beer')+'s',
            orderBy: 'score.avg',
            orderDir: "-",
            sort: sortScore,
            headers: [{
                    field:'name',
                    caption: $translate('beer.data.beer'),
                    type: 'link',
                    href: function(row) {
                    	return '#/beer/detail/' + row._id;
                    }
                },{
                    field:'brewery.name',
                    caption: $translate('beer.data.brewery')
                },{
                    field:'style.name',
                    caption: $translate('beer.data.style')
                },{
                    field:'score.avg',
                    caption: $translate('beer.data.score'),
                    tooltip: $translate('beer.data.score.help'),
                    class: function(beer) {
                    	if ( beer.score ) {
                    		return 'badge alert-' + DLHelper.colorByScore(beer.score.avg);		
                    	} else {
                    		return 'badge';
                    	}
                    },
                    sort: sortScore
                },{
                    field:'score.style',
                    caption: 'G / S',
                    tooltip: $translate('beer.data.score.gs.help'),
                    valueTemplateUrl: 'beer/list/score.html'
                },{
                    field:'score.count',
                    caption: 'Valoracion',
                    tooltip: 'Cantidad de valoraciones'
                },{
                    field:'',
                    caption: 'Mi Cal.',
                    tooltip: 'El promedio de mis calificaciones a esta cerveza',
                    valueTemplateUrl: 'beer/list/my-score.html'
                }
            ]
        };
	});

	beer.controller("NewStyleByLabelController", function($scope, $modalInstance, StyleByLabel) {
		$scope.styleByLabel = new StyleByLabel();
		$scope.ok = function () {
		    $modalInstance.close($scope.styleByLabel);
		};
		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	});

	beer.controller("NewBreweryController", function($scope, $modalInstance, Brewery) {
		$scope.brewery = new Brewery();
		$scope.ok = function () {
		    $modalInstance.close($scope.brewery);
		};
		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	});

	beer.controller("BeerEditController", 
		        ['$scope', 'Beer','$routeParams', 'Style', 'StyleByLabel', '$location', '$modal', 'Brewery', '$rootScope', '$timeout', '$q',
		function( $scope,   Beer,  $routeParams,   Style,   StyleByLabel,   $location,   $modal,   Brewery,   $rootScope,   $timeout,   $q) {
			
			//Load combos and beer			
			$q.all([
				Style.query().$promise, 
				StyleByLabel.query().$promise, 
				Brewery.query().$promise])
					.then(function(result) {
						$scope.styles = result[0];
						$scope.stylesByLabel = result[1];
						$scope.breweries = result[2];

						//Load Beer o create New (After wait for load all combos)
						if ( $routeParams.beer_id ) {
							$scope.beer = Beer.get({_id: $routeParams.beer_id});	
						} else {
							$scope.beer = new Beer();
						}
			});

			$scope.openNewBrewery = function () {
				var modalInstance = $modal.open({
				  	templateUrl: 'beer/brewery.html',
				  	controller: 'NewBreweryController'
				});

				modalInstance.result.then(function (brewery) {
				  	brewery._id = brewery.name.replace(/[^a-z0-9]/ig, '');
				  	
				  	brewery.$save(function(saved) {
						$scope.breweries = Brewery.query(function() {
							$timeout(function() {
								$scope.beer.brewery = saved._id;
							},100);
							
						});
					});

				});
			};

			$scope.openNewStyleByLabel = function () {
				var modalInstance = $modal.open({
				  	templateUrl: 'beer/style-by-label.html',
				  	controller: 'NewStyleByLabelController'
				});

				modalInstance.result.then(function (styleByLabel) {
				  	console.log("StyleByLabel",styleByLabel);
				  	styleByLabel._id = styleByLabel.name.replace(/[^a-z0-9]/ig, '');
				  	styleByLabel.$save(function(saved) {
						$scope.stylesByLabel = StyleByLabel.query(function() {
							$timeout(function() {
								$scope.beer.styleByLabel = saved._id;
							},100);
						});
					});
				});
			};

			//Save
			$scope.save = function() {
				if ( !$scope.beer._id ) {
					$scope.beer._id = $scope.beer.name.replace(/[^a-z0-9]/ig, '') + "-" + new Date().getTime();
				}
				$scope.beer.$save(function(beer) {
					$location.path('/beer/detail/' + beer._id);
				});
			};


	}]);

	beer.controller("BeerDetailController", 
		        ['$scope', 'Beer','$routeParams', 'Style', 'StyleByLabel', '$location', '$modal',
		function( $scope,   Beer,  $routeParams,   Style,   StyleByLabel,   $location,   $modal) {

			//Load Styles
			$scope.styles = Style.query();
			$scope.stylesByLabel = StyleByLabel.query();

			$scope.beer = Beer.get({_id: $routeParams.beer_id, populate:true});

	}]);


	/*
	 * Directives
	 */
	beer.directive("beerDetail", function() {
		return {
			restrict : 'A',
            scope : {
                beer: '=beerDetail'
            },
            templateUrl: 'beer/beer-detail-directive.html',
            controller: function($scope, DLHelper) {
            	$scope.scoreClass = function(score) {
            		return 'text-' + DLHelper.colorByScore(score);
            	}
            }
		};
	});

	return beer;
});