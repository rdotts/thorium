import Flight from "../../classes/flight";
import Simulator from "../../classes/simulator";

describe("Flight", () => {
  test("should throw if called without the 'new' operator", () => {
    expect(() => {
      const c = Flight();
    }).toThrow(/Class constructor Flight cannot be invoked without 'new'/);
  });

  describe("constructor", () => {
    test("should set default parameters", () => {
      const f = new Flight();
      expect(f.class).toBe("Flight");
      expect(f.id).toEqual(
        expect.stringMatching(
          /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/,
        ),
      );
      expect(f.name).toBeDefined();
      expect(f.date).toBeDefined();
      expect(f.running).toBe(false);
      expect(f.simulators).toEqual([]);
    });
  });

  describe("addSimulator", () => {
    test("should add a simulator", () => {
      const f = new Flight();
      const s = new Simulator();
      f.addSimulator(s);
      expect(f.simulators[0]).toBe(s.id);
    });
  });

  describe("removeSimulator", () => {
    test("should remove a simulator", () => {
      const f = new Flight();
      const s = new Simulator();
      f.addSimulator(s);
      f.removeSimulator(s.id);
      expect(f.simulators.length).toBe(0);
    });
  });

  describe("stopFlight, pause, and resume", () => {
    test("should stop, pause, or resume a flight", () => {
      const f = new Flight({running: true});
      expect(f.running).toBe(true);
      f.pause();
      expect(f.running).toBe(false);
      f.resume();
      expect(f.running).toBe(true);
      f.stopFlight();
      expect(f.running).toBe(false);
    });
  });
});
