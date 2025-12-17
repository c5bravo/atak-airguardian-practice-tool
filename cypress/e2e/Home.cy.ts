describe("AircraftForm", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api").as("postAircraft");
    cy.visit("/");
  });

  it("adds aircraft, adds waypoints, and deletes the aircraft", () => {
    // Fill the form
    cy.get("input[id=id]").type("FIN008");
    cy.get("input[id=altitude]").type("35000");
    cy.get("input[id=speed]").type("1500");

    // Set new start position (clicking the button)
    cy.get(".leaflet-container")
      .should("be.visible")
      .click(400, 250, { force: true });
    cy.contains("button", "Add WayPoints").click();

    cy.get(".leaflet-container").click(300, 250, { force: true });
    cy.get(".leaflet-container").click(200, 250, { force: true });

    // Activate "Adding Waypoints" mode
    // cy.get("[data-cy=add-waypoints]")
    //   .click()
    //   .should("have.class", "bg-blue-600");

    // Add the aircraft
    cy.get('[data-cy="Add Aircraft"]')
      .click()
      .find("svg")
      .should("have.class", "mr-2")
      .and("have.class", "h-4")
      .and("have.class", "w-4");

    // Delete the aircrafts
    cy.get('[data-cy="delete-aircraft-1"]').click();
  });
});
