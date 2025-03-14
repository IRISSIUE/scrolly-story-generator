import { isNumber } from "../common.js";

describe("Common Test Module", () => {
  describe("isNumber", () => {
    it("should return true for things that can be converted to numbers", () => {
      expect(isNumber(123)).to.be.true;
      expect(isNumber(-123)).to.be.true;
      expect(isNumber(0)).to.be.true;
      expect(isNumber(123.45)).to.be.true;
      expect(isNumber("123")).to.be.true;
    });

    it("should return false for things that can't be converted to numbers", () => {
      expect(isNumber(NaN)).to.be.false;
      expect(isNumber(null)).to.be.false;
      expect(isNumber(undefined)).to.be.false;
      expect(isNumber({})).to.be.false;
      expect(isNumber([])).to.be.false;
      expect(isNumber("123b")).to.be.false;
    });
  });
});
