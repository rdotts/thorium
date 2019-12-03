import React, {Component} from "react";
import {Label, Input, FormGroup} from "helpers/reactstrap";
import gql from "graphql-tag.macro";
import HashtagDefinition from "../../../../../../helpers/hashtagDefinition";

export default class GenericConfig extends Component {
  constructor(props) {
    super(props);
    this.state = props.args;
  }
  componentDidUpdate(oldProps) {
    if (JSON.stringify(oldProps.args) !== JSON.stringify(this.props.args)) {
      this.setState(this.props.args);
    }
  }
  update = (evt, which) => {
    const {simulatorId, systemId, id, client} = this.props;
    const mutation =
      systemId === "simulator"
        ? gql`
            mutation UpdateDamageStep(
              $simulatorId: ID!
              $step: DamageStepInput!
            ) {
              updateSimulatorDamageStep(simulatorId: $simulatorId, step: $step)
            }
          `
        : gql`
            mutation UpdateDamageStep($systemId: ID!, $step: DamageStepInput!) {
              updateSystemDamageStep(systemId: $systemId, step: $step)
            }
          `;
    const variables = {
      simulatorId,
      systemId,
      step: {
        id,
        args: {
          [which]:
            evt.target.checked || evt.target.checked === false
              ? evt.target.checked
              : evt.target.value,
        },
      },
    };
    client.mutate({mutation, variables, refetchQueries: ["Simulators"]});
  };
  render() {
    return (
      <div>
        <div>Inventory Config</div>
        <HashtagDefinition system />
        <FormGroup check>
          <Label check>
            Put at end of report?{" "}
            <Input
              type="checkbox"
              checked={this.props.args.end}
              onChange={evt => this.update(evt, "end")}
            />
          </Label>
        </FormGroup>
        <Label>Inventory</Label>
        <Input
          type="textarea"
          value={this.state.inventory || ""}
          onChange={evt => this.setState({inventory: evt.target.value})}
          onBlur={evt => this.update(evt, "inventory")}
        />
        <small>Leave blank for 1 - 3 random inventory items</small>
        <Label>Room</Label>
        <Input
          type="text"
          value={this.state.room || ""}
          onChange={evt => this.setState({room: evt.target.value})}
          onBlur={evt => this.update(evt, "room")}
        />
        <small>Leave blank to send to system room</small>
      </div>
    );
  }
}
