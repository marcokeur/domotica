var dgram       = require('dgram');
var client;

var self = {
    
    //holds all known devices
    devices: [
        {   id:     0,
            name:   'group1',
            on:     0x45,
            off:    0x46,
            state: {
                onoff:  'off'
            }
        },
        {   id:     1,
            name:   'group2',
            on:     0x47,
            off:    0x48,
            state: {
                onoff: 'off'
            }
        }
    ],

    init: function( devices, callback ) {
        
        client = dgram.createSocket('udp4');

        client.bind(8899, "255.255.255.255");
        client.on("listening", function () {
            client.setBroadcast(true);
            var address = client.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
        });

        client.on('message', function (message, remote) {
            var rxMsg = Array();

            rxMsg.push(message[0]);
            rxMsg.push(message[1]);
            rxMsg.push(message[2]);

            for(var deviceId in self.devices){
                if(rxMsg[0] == self.devices[deviceId].on){
                    console.log('Turning device ' + self.devices[deviceId].name + ' on');
                    
                    self.devices[deviceId].state.onoff = 'on';
                    
                    // emit realtime event if something has changed
                    Manager.manager('drivers').realtime('bulb', {
                        id: self.devices[deviceId].id
                    }, 'state', self.devices[deviceId].state);
                }else if(rxMsg[0] == self.devices[deviceId].off){
                    console.log('Turning device ' + self.devices[deviceId].name + ' off');
                    
                    //self.devices[deviceId].state.onoff = 'off';
                    self.capabilities.onoff.set( deviceId, false, function(){                    
                        // emit realtime event if something has changed
                        Manager.manager('drivers').realtime('bulb', {
                            thing: 'com.milight',
                            driver: 'bulb',
                            device: self.devices[deviceId].id,
                            state: {
                                'onoff' : self.devices[deviceId].state
                            }
                        });
                    });                    
                }
            }
        });
        
        callback();
    },

	getDevice: function( id ) {
		if( typeof this.devices[id] == 'undefined' ) return new Error("device is not connected (yet)");
		return this.devices[id];
	},
    
    getStatus: function( device ) {
        return device;
    },
    
    update: function( id ) {
        var device = self.getDevice( id );
        var message = [];
        if ( device.state.onoff ) {
            message.push(device.on);  
        }else{
            message.push(device.off);    
        }
        
        message.push(0x00);
        message.push(0x55);
        
        var buf = new Buffer(message);
        
        console.log(buf.toString('hex'));
        client.send(buf, 0, buf.length, 8899, '255.255.255.255', function(err, bytes){
            console.log('data send');
        });
    },

    capabilities: {

        onoff: {
            get: function( device, callback ){
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                callback( device.state.onoff );
            },
            set: function( device, onoff, callback ) {
                var device = self.getDevice( device.id );
                if( device instanceof Error ) return callback( device );

                if(onoff){
                    device.state.onoff = 'on';
                }else{
                    device.state.onoff = 'off';
                }
                self.update( device.id );

                callback( device.state.onoff );
            }
        }
    }
}

module.exports = self;