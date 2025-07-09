import { throwGoogleSheetErrorIfExists } from "../google-sheet.js";
import { ScrollyError } from "../common.js";

describe("Google Sheet Tests", () => {
  describe("throwGoogleSheetErrorIfExists", () => {
    let responseJson =
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
          throwGoogleSheetErrorIfExists(hasError, responseJson);
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
        throwGoogleSheetErrorIfExists(hasError, responseJson);
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
        throwGoogleSheetErrorIfExists(hasError, responseJson);
      }).to.throw(ScrollyError, "Could not find the data file");
    });
  });
});
