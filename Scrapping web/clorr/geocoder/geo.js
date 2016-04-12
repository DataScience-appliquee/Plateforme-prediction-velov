var geocoder = require("geocoder")
geocoder.selectProvider('google',{key:"-------------"});

var cache = {};

module.exports.geocode = function(address, callback, error_callback) {
	if(cache[address]) {
		callback(cache[address]);
	} else {
		geocoder.geocode(address, function ( err, data ) {
			if(data && data.results && data.results[0] && data.results[0].geometry && data.results[0].geometry.location) {
				var res = data.results[0].geometry.location;
				cache[address] = res
				callback(res);
			} else {
				error_callback(err);
			}
		});
	}
}