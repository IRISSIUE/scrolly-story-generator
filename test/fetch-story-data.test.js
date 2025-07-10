import { throwErrorIfGoogleSheetError } from "../fetch-story-data.js";
import { throwErrorIfExcelSheetIsMissingSheetNames } from "../fetch-story-data.js";
import { convertExcelDataToScrollyData } from "../fetch-story-data.js";
import { ScrollyError } from "../common.js";

describe("Excel Sheet Tests", () => {
  describe("throwErrorIfExcelSheetIsMissingSheetNames", () => {
    it("should not throw error worksheet has the right sheetnames", () => {
      const worksheet = {
        SheetNames: ["Story", "Another", "Steps"],
      };
      const sheetNames = ["Story", "Steps"];

      expect(() => {
        throwErrorIfExcelSheetIsMissingSheetNames(worksheet, sheetNames);
      }).to.not.throw();
    });
    it("should throw an error if worksheet is missing a sheet name", () => {
      const worksheetMissingStory = {
        SheetNames: ["Another", "Steps"],
      };
      const worksheetMissingSteps = {
        SheetNames: ["Story", "Another"],
      };
      const sheetNames = ["Story", "Steps"];

      expect(() => {
        throwErrorIfExcelSheetIsMissingSheetNames(
          worksheetMissingStory,
          sheetNames
        );
      }).to.throw(ScrollyError, 'Spreadsheet must contain a "Story" sheet.');

      expect(() => {
        throwErrorIfExcelSheetIsMissingSheetNames(
          worksheetMissingSteps,
          sheetNames
        );
      }).to.throw(ScrollyError, 'Spreadsheet must contain a "Steps" sheet.');
    });
  });

  describe("convertExcelDataToScrollyData", () => {
    it("convert correct data correctly", () => {
      const worksheet = {
        SheetNames: ["Story", "Steps"],
        Sheets: {
          Story: {
            "!ref": "A1:C2",
            A1: { v: "ScrollType", t: "s" },
            B1: { v: "Title", t: "s" },
            C1: { v: "Subtitle", t: "s" },
            A2: { v: "left-side", t: "s" },
            B2: { v: "A Title", t: "s" },
            C2: { v: "A subtitle", t: "s" },
          },
          Steps: {
            "!ref": "A1:H2",
            A1: { v: "ContentType", t: "s" },
            B1: { v: "FilePath", t: "s" },
            C1: { v: "AltText", t: "s" },
            A2: { v: "image", t: "s" },
            B2: { v: "media/test.jpg", t: "s" },
            C2: { v: "Test image", t: "s" },
          },
        },
      };
      const sheetNames = ["Story", "Steps"];
      const actualResult = convertExcelDataToScrollyData(worksheet, sheetNames);

      expect(actualResult).to.be.an("object");
      expect(actualResult.storyData).to.be.an("object");
      expect(actualResult.stepData).to.be.an("array");

      // Test specific values
      expect(actualResult.storyData.scrollType).to.equal("left-side");
      expect(actualResult.storyData.title).to.equal("A Title");
      expect(actualResult.storyData.subtitle).to.equal("A subtitle");

      expect(actualResult.stepData).to.have.length(1);
      expect(actualResult.stepData[0].contentType).to.equal("image");
      expect(actualResult.stepData[0].filePath).to.equal("media/test.jpg");
      expect(actualResult.stepData[0].altText).to.equal("Test image");
    });
  });
});

describe("Google Sheet Tests", () => {
  describe("throwErrorIfGoogleSheetError", () => {
    it("should not throw error if response is successful", () => {
      const hasError = false;
      const responseJson = {
        error: {
          message: "Test error message",
        },
        // No error property
      };

      // Test that the function does NOT throw an error
      expect(() => {
        throwErrorIfGoogleSheetError(hasError, responseJson);
      }).to.not.throw();
    });

    it("Throw error if response has generic error", () => {
      const hasError = true;
      const responseJson = {
        error: {
          message: "Test error message",
        },
      };

      expect(() => {
        throwErrorIfGoogleSheetError(hasError, responseJson);
      }).to.throw(ScrollyError, "Test error message");
    });

    it("Throw specfic error if response has 404 error", () => {
      const hasError = true;
      const responseJson = {
        error: {
          code: 404,
          message: "Test error message",
        },
      };

      expect(() => {
        throwErrorIfGoogleSheetError(hasError, responseJson);
      }).to.throw(ScrollyError, "Could not find the data file");
    });
  });
});
