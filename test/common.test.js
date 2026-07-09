import { isNumber, isValidDate, StoryData } from "../common.js";

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

  describe("isValidDate", () => {
    it("should return true for values that can be parsed as dates", () => {
      expect(isValidDate("2020-01-01")).to.be.true;
      expect(isValidDate("January 1, 2020")).to.be.true;
    });

    it("should return false for invalid date values", () => {
      expect(isValidDate("")).to.be.false;
      expect(isValidDate("not-a-date")).to.be.false;
    });
  });

  describe("StoryData timeline validation", () => {
    it("should allow empty timeline values", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      );

      expect(() => storyData.validate("Testing story data")).to.not.throw();
    });

    it("should throw when timeline start date is invalid", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "bad-date",
        "",
        "",
      );

      expect(() => storyData.validate("Testing story data")).to.throw(
        'Timeline Start Date "bad-date" is invalid',
      );
    });

    it("should throw when timeline end date is invalid", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "",
        "bad-date",
        "",
      );

      expect(() => storyData.validate("Testing story data")).to.throw(
        'Timeline End Date "bad-date" is invalid',
      );
    });

    it("should throw when timeline tick interval is not a positive integer", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "",
        "",
        "2.5",
      );

      expect(() => storyData.validate("Testing story data")).to.throw(
        'Timeline Tick Interval of "2.5" is invalid',
      );
    });

    it("should throw when timeline start date is after end date", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "2025-01-01",
        "2024-01-01",
        "1",
      );

      expect(() => storyData.validate("Testing story data")).to.throw(
        "Timeline Start Date must be before Timeline End Date",
      );
    });

    it("should pass when timeline values are valid", () => {
      const storyData = new StoryData(
        "",
        "Title",
        "Subtitle",
        "End",
        33,
        "Author",
        "",
        "",
        "",
        "",
        "2020-01-01",
        "2025-01-01",
        "5",
      );

      expect(() => storyData.validate("Testing story data")).to.not.throw();
    });
  });
});
