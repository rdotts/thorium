import App from "../../app";
import produce from "immer";
import * as components from "../../classes/universe/components";
import {handlePatches} from "../../helpers/filterPatches";
import {pascalCase} from "change-case";

export function setComponent<C>(componentProperty) {
  const ComponentClass = components[pascalCase(componentProperty)] as C &
    (new (p) => C);
  type keys = keyof C;
  return function mutationHandler(rootQuery, {id, ...properties}, context) {
    const entityId = id || context.entityId;
    if (!entityId && entityId !== 0) return;
    const entityIndex = App.entities.findIndex(e => e.id === entityId);
    const flightId = App.entities[entityIndex].flightId;
    if (entityIndex === -1) return;
    if (Object.keys(properties).length === 0 && !id) {
      // No properties are being added, and the ID isn't
      // explicitly set; this component wasn't intended
      // to be added.
      return;
    }
    App.entities = produce(
      App.entities,
      draft => {
        const entity = draft[entityIndex];
        if (!entity[componentProperty]) {
          entity[componentProperty] = new ComponentClass({
            ...properties,
          });
        } else {
          Object.entries(properties).forEach(([key, value]) => {
            entity[componentProperty][key] = value;
          });
        }
      },

      handlePatches({
        context,
        publishKey: "entities",
        subFilterValues: {flightId: flightId},
      }),
    );
  };
}
