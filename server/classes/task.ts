import uuid from "uuid";
import App from "../app";
import taskDefinitions from "../tasks";
import {randomFromList} from "./generic/damageReports/constants";
import Simulator from "./simulator";
import {Station} from "./stationSet";

export type ValueDef = {
  [key: string]: {
    input: ({
      simulator,
      stations,
    }: {
      simulator?: Simulator;
      stations?: Station[];
    }) => any;
    value: ({
      simulator,
      stations,
    }: {
      simulator?: Simulator;
      stations?: Station[];
    }) => any;
  };
};
interface TaskDefinition {
  name: string;
  class: string;
  active: ({simulator}: {simulator: Simulator}) => boolean;
  stations: ({simulator}: {simulator: Simulator}) => Station[];
  values: ValueDef;
  instructions: ({
    simulator,
    requiredValues,
    task,
  }: {
    simulator: Simulator;
    requiredValues: {[key: string]: any};
    task: any;
  }) => string;
  verify: ({
    simulator,
    requiredValues,
  }: {
    simulator: Simulator;
    requiredValues: {[key: string]: any};
  }) => boolean;
}

export class Macro {
  id: string;
  event: string;
  args: string;
  delay: number;
  noCancelOnReset: boolean;
  constructor(params: Partial<Macro>) {
    this.id = params.id || uuid.v4();
    this.event = params.event || "";
    this.args = params.args || "{}";
    this.delay = params.delay || 0;
    this.noCancelOnReset = params.noCancelOnReset || false;
  }
}
export default class Task {
  id: string;
  class: "Task" = "Task";
  definition: string;
  simulatorId: string;
  station: string;
  taskTemplate: string;
  systemId: string;
  deck: string;
  room: string;
  values: any;
  verified: boolean;
  dismissed: boolean;
  verifyRequested: boolean;
  startTime: Date;
  endTime: Date;
  timeElapsedInMS: number;
  macros: Macro[];
  assigned: boolean | string;
  constructor(params: Partial<Task> = {}) {
    // The check to see if the task is relevant was already handled
    // before this task was instantiated

    this.id = params.id || uuid.v4();
    this.class = "Task";

    // The static object which defines the values and
    // methods for the task
    this.definition = params.definition || "Generic";

    // The values from the task template are stamped onto the task when it is created.

    // Get the random values provided by the task definition
    const definitionObject: TaskDefinition = taskDefinitions.find(
      t => t.name === this.definition,
    ) as TaskDefinition;

    this.simulatorId = params.simulatorId || "";
    const simulator = App.simulators.find(s => s.id === this.simulatorId);
    const stations = definitionObject.stations
      ? definitionObject.stations({simulator})
      : simulator && simulator.stations;
    this.station =
      params.station === "nothing" || !params.station
        ? stations.length > 0
          ? randomFromList(stations).name
          : "None"
        : params.station;

    this.taskTemplate = params.taskTemplate || "";

    // For damage reports
    this.systemId = params.systemId || "";

    // For security incidents
    this.deck = params.deck || "";
    this.room = params.room || "";

    const definitionValues = definitionObject.values
      ? Object.entries(definitionObject.values).reduce((prev, [key, value]) => {
          prev[key] = value.value({simulator, stations: simulator.stations});
          return prev;
        }, {})
      : {};

    // Get the values determined by the task template or instantiated when the task is created

    let setValues = {};
    if (this.taskTemplate) {
      const template = App.taskTemplates.find(t => t.id === this.taskTemplate);
      if (template) {
        setValues = {...template.values};
      }
    } else {
      setValues = params.values || {};
    }

    this.values = {...definitionValues, ...setValues};

    // Task parameters
    this.verified = params.verified || false;
    this.dismissed = params.dismissed || false;
    this.verifyRequested = params.verifyRequested || false;

    // Timing
    this.startTime = new Date();
    this.endTime = null;
    this.timeElapsedInMS = params.timeElapsedInMS || 0;

    // Macros
    this.macros = [];
    params.macros && params.macros.map(m => this.macros.push(new Macro(m)));

    // Task Report Assignment
    this.assigned = params.assigned || false;
  }
  verify(dismiss) {
    if (this.verified) return;
    this.verified = true;
    if (dismiss) this.dismissed = true;
    this.verifyRequested = false;
    this.endTime = new Date();

    // Trigger all the macros, unless it is assigned
    // If it is assigned, then there is another task
    // that will execute the macros when it is verified.
    this.macros.length > 0 &&
      !this.assigned &&
      App.handleEvent(
        {simulatorId: this.simulatorId, macros: this.macros},
        "triggerMacros",
      );

    if (this.assigned) {
      const task = App.tasks.find(t => t.id === this.assigned);
      if (task) task.verify(dismiss);
    }
  }
  dismiss() {
    this.dismissed = true;
  }
  requestVerify() {
    this.verifyRequested = true;
  }
  denyVerify() {
    this.verifyRequested = false;
  }
  assign() {
    this.assigned = true;
  }
}
