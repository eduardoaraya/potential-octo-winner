export const isProd = () =>
  process.env?.NODE_ENV?.toLowerCase().startsWith("prod");
