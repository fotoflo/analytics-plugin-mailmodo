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

  describe("identify", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('identify calls track with "identify" event', async () => {
      const plugin = mailmodoPlugin({ token: "test-token" });
      const userId = "123";
      const traits = { email: "test@example.com" };

      plugin.identify("123", traits);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("identify"),
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
      const userId = "123";
      const traits = { email: "test@example.com" };

      plugin.identify(userId, traits);
      jest.clearAllMocks(); // Clear any mocks before calling track

      // Call the track method
      await plugin.track(event, properties);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Get the fetch call arguments
      const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0];
      const fetchUrl = fetchCallArgs[0];
      const fetchOptions = fetchCallArgs[1];

      expect(fetchUrl).toBe(`https://api.mailmodo.com/v1/event/${event}`);

      expect(fetchOptions.method).toBe("POST");

      expect(fetchOptions.headers).toEqual({
        "Content-Type": "application/json",
        mmApiKey: "test-token",
      });

      // Parse the JSON body to an object to assert its structure
      const fetchBody = JSON.parse(fetchOptions.body);

      // Assert that the email in the fetch body is as expected
      expect(fetchBody.email).toBe(traits.email);

      // Assert the structure of event_properties is as expected
      expect(fetchBody.event_properties).toEqual(
        expect.objectContaining({
          ...properties,
          userId: userId, // assuming userId should be part of the event_properties
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
      console.error = jest.fn();

      const plugin = mailmodoPlugin({ token: "test-token" });
      // Set initial user traits
      await plugin.identify("123", { email: "test@example.com" });
      jest.clearAllMocks();

      await plugin.reset();
      await plugin.track("test-event", {});

      expect(console.error).toHaveBeenCalledWith(
        "User email is required for Mailmodo events"
      );

      expect(global.fetch).toHaveBeenCalledTimes(1); // identify and logout
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/logout"),
        expect.anything()
      );
    });
  });

  describe("error handling", () => {
    it("initialization fails without token, logs error", async () => {
      jest.clearAllMocks();
      console.error = jest.fn();

      mailmodoPlugin({ token: "" });

      expect(console.error).toHaveBeenCalledWith(
        "Mailmodo API token is required for all events, please add it to the pluginConfig"
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
