(function( window ){
  window.Courier = function Courier(){
    var subscriptions = {};

    this.receive = function receive( box, opener ){
      var subscription = createSubscription({
        box: stringify( box ), opener: opener
      });

      subscriptions[ box ] = ( subscriptions[ box ] || [] );
      subscriptions[ box ].push( subscription );

      return unsubscribe.bind( {}, subscription );
    };

    this.send = function send( box, message, options, callback ){
      callback = is( options, "Function" ) ? options : ( callback || function(){} );
      options = is( options, "Object" ) ? options : { throwOnMissing: true };

			boxFetcherFor( false )
				.withName( "all", andPassAlongThe( box, callback ) );
			boxFetcherFor( options.throwOnMissing )
				.withName( box, andPassAlongThe( message, callback ) );
    };

    this.reset = function reset() { subscriptions = {}; }

		function andPassAlongThe( message, callback ){
			var	results = [];

			return function( openers ){
				var i = openers.length;

				while ( i-- ) {
					results.push( openers[ i ].opener( message ) );
				}

				return callback( results );
			}
		}

		function boxFetcherFor( throwOnMissing ){
			return {
				withName: function( box, callback ){
					var foundOne = false,
							senderPattern = new RegExp( box ),
							receiverPattern;

					for ( var name in subscriptions ) {
						receiverPattern = new RegExp( stringify( name ) );

						if ( senderPattern.exec( stringify( name ) ) || receiverPattern.exec( stringify( box ) ) ) {
							callback( subscriptions[ name ] );
							foundOne = true;
						}
					}
					if ( !foundOne && throwOnMissing === true ) {
						throw "Courier: No receiver registered for '" + box + "'";
					}
				}
			};
    }

    function unsubscribe( subscription ){
      subscriptions[ subscription.box ] =
      subscriptions[ subscription.box ].filter( function( subs ){
        return subs.id !== subscription.id;
      });

      if ( subscriptions[ subscription.box ].length === 0 ) {
        delete subscriptions[ subscription.box ];
      }
    }

    function createSubscription( spec ){
      spec.id = "#" + Math.floor(
        Math.random()*16777215
      ).toString( 16 );

      return spec;
    }

    function stringify( name ){
      return name.toString()
                 .replace(/(^\/|\/$)/g, "");
    }
  }

  function is( func, type ) {
    return func && {}.toString.call(func) === "[object " + type + "]";
  }
})( window );
