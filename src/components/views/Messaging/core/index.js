import React from "react";
import {Query} from "react-apollo";
import gql from "graphql-tag.macro";
import SubscriptionHelper from "helpers/subscriptionHelper";
import Conversations from "./conversations";
import playSound from "../../../generic/SoundPlayer";
const fragment = gql`
  fragment MessageData on Message {
    id
    sender
    content
    timestamp
    simulatorId
    destination
  }
`;
export const MESSAGING_CORE_QUERY = gql`
  query Messages($simulatorId: ID!) {
    messages(simulatorId: $simulatorId) {
      ...MessageData
    }
    teams(simulatorId: $simulatorId, cleared: true) {
      id
      name
      type
      cleared
    }
  }
  ${fragment}
`;

export const MESSAGING_CORE_SUB = gql`
  subscription GotMessage($simulatorId: ID!) {
    sendMessage(simulatorId: $simulatorId) {
      ...MessageData
    }
  }
  ${fragment}
`;

export const MESSAGING_TEAMS_CORE_SUB = gql`
  subscription TeamsUpdate($simulatorId: ID) {
    teamsUpdate(simulatorId: $simulatorId, cleared: true) {
      id
      name
      type
      cleared
    }
  }
`;

const MessagingData = props => (
  <Query
    query={MESSAGING_CORE_QUERY}
    variables={{simulatorId: props.simulator.id}}
  >
    {({loading, data, subscribeToMore}) => {
      if (loading || !data) return null;
      const {messages, teams} = data;
      return (
        <SubscriptionHelper
          subscribe={() =>
            subscribeToMore({
              document: MESSAGING_CORE_SUB,
              variables: {simulatorId: props.simulator.id},
              updateQuery: (previousResult, {subscriptionData}) => {
                if (!subscriptionData.data.sendMessage) return previousResult;
                const data = Object.assign({}, previousResult, {
                  messages: previousResult.messages.find(
                    m => m.id === subscriptionData.data.sendMessage.id,
                  )
                    ? previousResult.messages
                    : previousResult.messages.concat(
                        subscriptionData.data.sendMessage,
                      ),
                });
                // Play a sound!
                const stationNames = props.simulator.stations.map(s => s.name);
                if (
                  stationNames.indexOf(
                    subscriptionData.data.sendMessage.sender,
                  ) > -1
                ) {
                  props.playSound({url: require("./Mouse.ogg")});
                }
                return data;
              },
            })
          }
        >
          <SubscriptionHelper
            subscribe={() =>
              subscribeToMore({
                document: MESSAGING_TEAMS_CORE_SUB,
                variables: {
                  simulatorId: props.simulator.id,
                },
                updateQuery: (previousResult, {subscriptionData}) => {
                  return Object.assign({}, previousResult, {
                    teams: subscriptionData.data.teamsUpdate,
                  });
                },
              })
            }
          />
          <div
            style={{height: "100%", display: "flex", flexDirection: "column"}}
          >
            <Conversations
              {...props}
              messages={messages.filter(
                m =>
                  !teams.find(
                    t =>
                      t.cleared === true &&
                      (t.name === m.sender || t.name === m.destination),
                  ),
              )}
              teams={teams.filter(t => !t.cleared)}
            />
          </div>
        </SubscriptionHelper>
      );
    }}
  </Query>
);
export default playSound(MessagingData);
