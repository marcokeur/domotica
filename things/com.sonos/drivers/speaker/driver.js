var sonos = require('sonos');

var speakers = [];
	
//var self = module.exports;

var self = {

	init: function( devices, callback ){

		sonos
			.search()
			.on('DeviceAvailable', function (device, model) {
				console.log('DeviceAvailable ' + model + ': ' + JSON.stringify(device));

				device.deviceDescription(function(err, metadata){
					if( err ) return;

					speakers.push({
						name: metadata.roomName + ' (' + metadata.displayName + ')',
						data: {
							id: metadata.UDN, //metadata.serialNum,
							host: device.host,
							port: device.port
						}
					});

				})

			});

		// we're ready
		callback();
	},

	apiGetCollection: function() {
		var response = [];

		//set http response code
		response['status'] = 200;
		response['data'] = self.speakers;

		return response;
	},

	apiGetElement: function(element){
		var response = [];

		//find the specific flow
		for(var i in self.speakers){
			//if correct flow is found
			if(self.speakers[i].id == element){
				//set http response code
				response['status'] = 200;
				response['data'] = self.speakers[i];

				return response;
			}
		}

		response['status'] = 404;
		return response;
	},

	play: function (host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.play(uri, function (err, playing) {
			console.log([err, playing]);
		});
	},

	stop: function(host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.stop(function (err) {
			console.log(err);
		});
	},

	pause: function(host, uri) {
		var sonosDevice = new sonos.Sonos(host);

		sonosDevice.pause(function (err) {
			console.log(err);
		});
	}
};

module.exports = self;