define([], function() {

	var misc = angular.module("dl.misc", ['dl.resources']);

    misc.factory("Cache", function(Category, Style) {
        var _categories = null;
        var _styles = null;
        return {
            categories: function() {
                return _categories || ( _categories = Category.query() );
            },
            styles: function() {
                return _styles || ( _styles = Style.query() );
            }
        };
    });

    misc.factory("MainTitle", function() {
        var main = '';
        var add = null;
        var replace = null;
        return {
            get: function() {
                if ( add ) {
                    return add + ' - ' + main;
                } else if ( replace ) {
                    return replace;
                } else {
                    return main;    
                }
            },
            set: function(title) {
                main = title;
            },
            add: function(title) {
                add = title;
            },
            clearAdd: function() {
                add = null;
            },
            replace: function(title) {
                replace = title;
            },
            clearReplace: function() {
                replace = null;
            }
        };
    });

    misc.factory("Responsive", function($window) {
        return {
            isXs: function() {
                return $window.document.width < 768;
            },
            isSm: function() {
                return $window.document.width >= 768 && $window.document.width < 992;
            },
            isMd: function() {
                return $window.document.width >= 992 && $window.document.width < 1200;
            },
            isLg: function() {
                return $window.document.width >= 1200;
            }
        };
    });

    return misc;

});