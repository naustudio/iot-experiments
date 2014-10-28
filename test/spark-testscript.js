/*global console, spark*/
'use strict';
var selectedDevice;
spark.login({accessToken: '532963e6a1ec67a453cb8a7124c1d4631d92a2da'});
spark.listDevices(function(devices) {
  selectedDevice = devices[0];

  console.log('Device name: ' + selectedDevice.name);
  console.log('- connected?: ' + selectedDevice.connected);
});

var devicesPr = spark.getAttributesForAll();
devicesPr.then(
  function(data){
    console.log('Core attrs retrieved successfully:', data);
  },
  function(err) {
    console.log('API call failed: ', err);
});

var devicesPr = spark.listDevices();
devicesPr.then(
  function(devices){
  	selectedDevice = devices[0];
    console.log('Devices: ', devices);
  },
  function(err) {
    console.log('List devices call failed: ', err);
  }
);
// call function in device
selectedDevice.getAttributes(function(err, data) {
  if (err) {
    console.log('An error occurred while getting device attrs:', err);
  } else {
    console.log('Device attrs retrieved successfully:', data);
  }
});
//Call getNumber function
selectedDevice.callFunction('getNumber', '', function(err, data) {
  if (err) {
    console.log('An error occurred:', err);
  } else {
    console.log('Function called succesfully:', data);
  }
});

selectedDevice.callFunction('setNumber', '1', function(err, data) {
  if (err) {
    console.log('An error occurred:', err);
  } else {
    console.log('Function called succesfully:', data);
  }
});
