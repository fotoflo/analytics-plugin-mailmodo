/**
 * Mailmodo Events plugin for getanaltyics.io
 * by Alex Miller https://github.com/fotoflo
 *
 * @link https://getanalytics.io/plugins/mailmodo/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.token - The mailmodo api key
 * @return {object} Analytics plugin
 * @example
 *
 * mailmodoPlugin({
 *   token: 'abcdef123'
 * })
 */

import type { PluginConfig, UserTraits } from "../index.d.ts";

function mailmodoPlugin(pluginConfig: PluginConfig = { token: null }) {
  if (!pluginConfig.token) {
    console.error(
      "Mailmodo API token is required for all events, please add it to the pluginConfig"
    );
    return;
  }

  let userTraits = {
    userId: null,
    email: null,
  } as UserTraits;

  const track = (event: string, properties: object) => {
    if (!userTraits.email) {
      console.error("User email is required for Mailmodo events");
      return;
    }

    properties = {
      ...properties,
      ...userTraits,
    };

    return callMailmodoApi({ event, email: userTraits.email, properties });
  };

  const identify = (userId: string, traits: UserTraits) => {
    if (!userId) {
      console.error("User id is required for all events");
      return;
    }

    if (!traits.email) {
      console.error("User email is required for Mailmodo events");
      return;
    }

    userTraits = {
      ...userTraits,
      ...traits,
      userId,
    };

    return track("identify", userTraits);
  };

  const page = (properties: object) => {
    return track("page", properties);
  };

  const reset = () => {
    const result = track("logout", userTraits);
    userTraits = {
      userId: null,
      email: null,
    };
    return result;
  };

  async function callMailmodoApi({
    event,
    email,
    properties,
  }: {
    event: string;
    email: string;
    properties: object;
  }) {
    // https://www.mailmodo.com/developers/93cba3fa7f1ea-add-event
    if (!pluginConfig.token) {
      console.error(
        "Mailmodo API token is required for all events, please add it to the pluginConfig"
      );
      return;
    }
    try {
      const response = await fetch(
        `https://api.mailmodo.com/v1/event/${event}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            mmApiKey: pluginConfig.token,
          },
          body: JSON.stringify({
            email: email,
            event_properties: properties,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${new Date()} - Error during ${event} API call:`, error);
      throw error;
    }
  }

  const plugin = {
    name: "mailmodo",
    config: pluginConfig,
    track,
    identify,
    page,
    reset,
  };

  return plugin;
}

export default mailmodoPlugin;
