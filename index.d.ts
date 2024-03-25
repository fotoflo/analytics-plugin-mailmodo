export interface PluginConfig {
  token: string | null;
}

export type UserTraits = {
  email: string | null;
  [key: string]: string | null;
};

export interface MailmodoPlugin {
  track(event: string, properties: object): void;
  identify(userId: string, traits: UserTraits): void;
  page(properties: object): void;
  reset(): void;
}
