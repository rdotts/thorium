import React from "react";
import {waitForElementToBeRemoved, wait} from "@testing-library/react";
import render from "../../../helpers/testHelper";
import baseProps from "../../../stories/helpers/baseProps.js";
import Component, {CRM_QUERY, CRM_CLIENT_SUB, CRM_SUB} from "./index.js";

it("should render", async () => {
  const {container, getByText} = render(<Component {...baseProps} />, {
    queries: [CRM_QUERY, CRM_CLIENT_SUB, CRM_SUB],
  });
  await waitForElementToBeRemoved(() => getByText("Loading..."));
  await wait();
  expect(container.innerHTML).toBeTruthy();
  expect(container.innerHTML).not.toBe("Error");
});
