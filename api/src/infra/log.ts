import debug from "debug";

const appName = "schedule-api";

export const genericLog = debug(`${appName}:log`);
export const infraLog = debug(`${appName}:infra`);
export const errorLog = debug(`${appName}:error`);
