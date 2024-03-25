import mailmodoPlugin from "../analytics-plugin-mailmodo";

// Mocking the global fetch
global.fetch = jest.fn(
  () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as unknown as Promise<Response>
);

// Mocking the global fetch
global.fetch = jest.fn(
  () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as unknown as Promise<Response>
);

describe("mailmodoPlugin", () => {
  describe("initialization", () => {
    it("initializes with a token", () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      expect(plugin.config.token).toBe("test-token");
    });
  });

  describe.only("identify", () => {
    it('identify calls track with "identify" event', async () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      const userId = "123";
      const traits = { email: "test@example.com" };

      plugin.identify("123", traits);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/identify"),
        expect.anything()
      );
    });

    it("identify without userId or email logs error and does not call track", async () => {
      console.error = jest.fn();

      const plugin = mailmodoPlugin({ token: "test-token" });
      const userId = "";
      const traits = { email: "" };

      plugin.identify(userId, traits);

      expect(console.error).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("track", () => {
    it("track calls callMailmodoApi with correct parameters", async () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      const event = "test-event";
      const properties = { prop1: "value1" };

      // Mock identify to set the user email
      plugin.identify("123", { email: "test@example.com" });

      await plugin.track(event, properties);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.mailmodo.com/v1/event/${event}`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            mmApiKey: "test-token",
          },
          body: JSON.stringify({
            email: "test@example.com",
            event_properties: expect.objectContaining(properties),
          }),
        })
      );
    });
  });

  describe("page", () => {
    it('page calls track with "page" event', async () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      const properties = { page: "home" };

      // Mock identify to set the user email
      plugin.identify("123", { email: "test@example.com" });

      await plugin.page(properties);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/page"),
        expect.anything()
      );
    });
  });

  describe("reset", () => {
    it('reset calls track with "logout" event and clears user traits', async () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      // Set initial user traits
      plugin.identify("123", { email: "test@example.com" });

      await plugin.reset();

      // Attempt to track another event which should now fail
      await plugin.track("test-event", {});

      expect(console.error).toHaveBeenCalledWith(
        "User email is required for Mailmodo events"
      );
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only the logout event should have been called
    });
  });

  describe("error handling", () => {
    it("callMailmodoApi without token logs error", async () => {
      console.error = jest.fn();

      const plugin = mailmodoPlugin({ token: "" });
      await plugin.track("test-event", { prop: "value" });

      expect(console.error).toHaveBeenCalledWith(
        "Mailmodo API token is required for all events, please add it to the pluginConfig"
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
