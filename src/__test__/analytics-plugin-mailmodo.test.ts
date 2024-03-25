import mailmodoPlugin from "../analytics-plugin-mailmodo";

describe("analytics-plugin-mailmodo", () => {
  describe("mailmodoPlugin", () => {
    it("should return an object", () => {
      const plugin = mailmodoPlugin({ token: "123" });
      expect(plugin).toBeInstanceOf(Object);
    });
  });
});
