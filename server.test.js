const app = require("./app.js");
const request = require("supertest");
const romans = require("romans");
const chai = require("chai");

const chaiexpect = chai.expect;
chai.use(require("chai-sorted"));

describe("GET /romannumeral?query={param}", () => {
  /**
   * @method GET /romannumeral?query=1
   */
  it("Valid route with a valid 'query' parameter.", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ query: "1" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ input: "1", output: "I" });
  });

  /**
   * @method GET /romannumeral?query=qw
   */
  it("Invalid route with invalid 'query' parameter.", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ query: "qw" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });
});

describe("GET /romannumeral?min={param1}&max={param2}", () => {
  /**
   * @method GET /romannumeral?min=1&max=3999
   */
  it("Valid route with the greatest valid range possible ([1;3999]) where numbers are returned in ascending order.", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "1", max: "3999" });

    //Creating an array of 3999 elements, replacing each value for its "key+1", and converting this integer into an object with the corresponding arabic and roman number.
    expected = {
      conversions: Array.from({ length: 3999 }, (_, k) => (
        { input: `${k + 1}`, output: romans.romanize(k + 1)}
      ))
    };

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(expected);
    chaiexpect(
      response.body.conversions.map((x) => parseInt(x.input))
    ).to.be.sorted();
  });

  /**
   * @method GET /romannumeral?min=10&max=3
   */
  it("Invalid route with 'min' parameter greater than 'max'.", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "10", max: "3" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });

  /**
   * @method GET /romannumeral?min=3&max=3
   */
  it("Invalid route with 'min' parameter equal to 'max'.", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "3", max: "3" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });

  /**
   * @method GET /romannumeral?min=2.0&max=7
   */
  it("Invalid route with invalid 'min' parameter (not an integer).", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "2.0", max: "7" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });

  /**
   * @method GET /romannumeral?min=1&max=5.5
   */
  it("Invalid route with invalid 'max' parameter (not an integer).", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "1", max: "5.5" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });

  /**
   * @method GET /romannumeral?min=1l&max=2
   */
  it("Invalid route with invalid 'min' parameter (not a number).", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "1l", max: "2" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });

  /**
   * @method GET /romannumeral?min=10&max=nasd
   */
  it("Invalid route with invalid 'max' parameter (not a number).", async () => {
    const response = await request(app)
      .get("/romannumeral")
      .query({ min: "1", max: "nasd" });

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });
});

describe("GET *", () => {
  /**
   * @method GET /invAlidRoUte
   */
  it("General invalid routes.", async () => {
    const response = await request(app).get("/invAlidRoUte");

    expect(response.headers["content-type"])
      .toEqual("application/json; charset=utf-8");
    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual("Invalid route.");
  });
});
