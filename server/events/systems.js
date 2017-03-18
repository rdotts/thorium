import App from '../../app.js';
import { pubsub } from '../helpers/subscriptionManager';
import * as Classes from '../classes';

const sendUpdate = (sys) => {
  if (sys.type === 'Engine') pubsub.publish('speedChange', sys);
  if (sys.type === 'Transporters') pubsub.publish('transporterUpdate', sys);
  if (sys.type === 'Shield') pubsub.publish('shieldsUpdate', App.systems.filter((sys) => sys.type === 'Shield'));
  if (sys.type === 'Sensors') pubsub.publish('sensorsUpdate', App.systems.filter(s => s.type === 'Sensors'));
  if (sys.type === 'LongRangeComm') pubsub.publish('longRangeCommunicationsUpdate', App.systems.filter(s => s.type === 'LRCommunications'));
  if (sys.type === 'InternalComm') pubsub.publish('internalCommUpdate', App.systems.filter(s => s.type === 'InternalComm'))
  pubsub.publish('systemsUpdate', App.systems);
}
App.on('addSystemToSimulator', ({simulatorId, className, params}) => {
  const init = JSON.parse(params);
  init.simulatorId = simulatorId;
  const ClassObj = Classes[className];
  const obj = new ClassObj(init);
  App.systems.insert(obj);
  pubsub.publish('systemsUpdate', App.systems);
});
App.on('removeSystemFromSimulator', ({systemId}) => {
  App.systems = App.systems.filter(s => s.id !== systemId);
  pubsub.publish('systemsUpdate', App.systems);
});
App.on('damageSystem', ({systemId, report}) => {
  const sys = App.systems.find(s => s.id === systemId);
  console.log(sys, systemId);
  sys.break(report);
  sendUpdate(sys);
});
App.on('repairSystem', ({systemId}) => {
  const sys = App.systems.find(s => s.id === systemId);
  sys.repair();
  sendUpdate(sys);
});
App.on('changePower', ({systemId, power}) => {
  const sys = App.systems.find(s => s.id === systemId);
  console.log(systemId, power, sys);
  sys.setPower(power);
  sendUpdate(sys);
});
