/*global db*/

/*create karahappy-dev database*/
use iot-experiment;
db.createUser(
  {
    user: "siteadmin",
    pwd: "nau@123",
    roles:
    [
      {
        role: "dbOwner",
        db: "iot-experiment"
      }
    ]
  }
);

/*create counters collection*/
db.createCollection("motion", {capped: false, autoIndexId: false});
db.motion.insert({_id: 0, deviceId: '000001', recordDate: '2014-08-28T05:06:26.451Z', value: ''});

db.createCollection("counters", {capped: false, autoIndexId: false});
db.counters.insert({_id: 'userId', seq: 0});
db.counters.insert({_id: 'motionId', seq: 0});