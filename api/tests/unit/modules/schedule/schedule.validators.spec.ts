import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";
import {
  scheduleModule,
  IScheduleModule,
  isEndtimeBeforeStarttime,
  validateAgentDifFromAccount,
  toSchedule,
  validateSchedule,
  IScheduleBase,
} from "../../../../src/modules/schedule";
import { IUserBase } from "../../../../src/modules/user";

import { Meta } from "express-validator";

const sandbox = sinon.createSandbox();

describe("Schedule validators", () => {
  let scheduleModuleMock: IScheduleModule;

  beforeEach(async () => {
    const connection = sandbox.createStubInstance(PrismaClient);
    scheduleModuleMock = scheduleModule(connection);
  });

  afterEach(() => sandbox.restore());

  it("isEndtimeBeforeStarttime Should return true when endTime is after than startTime", () => {
    const startTime = new Date("2024-08-10T12:00:00");
    const endTime = new Date("2024-08-10T16:00:00");
    const req = {
      body: { startTime },
    };
    const result = isEndtimeBeforeStarttime(endTime.toString(), {
      req,
    } as unknown as Meta);
    expect(result).to.be.true;
  });

  it("isEndtimeBeforeStarttime Should return false when endTime is before than startTime", () => {
    const startTime = new Date("2024-08-10T17:00:00");
    const endTime = new Date("2024-08-10T16:00:00");
    const req = {
      body: { startTime },
    };
    const result = isEndtimeBeforeStarttime(endTime.toString(), {
      req,
    } as unknown as Meta);
    expect(result).to.be.false;
  });

  it("validateAgentDifFromAccount Should return true if account is diffente than agent", () => {
    const account = {
      id: 1,
    } as IUserBase;
    const agent = {
      id: 2,
    } as IUserBase;
    const req = {
      body: { account },
    };
    const result = validateAgentDifFromAccount(agent, {
      req,
    } as unknown as Meta);
    expect(result).to.be.true;
  });

  it("validateAgentDifFromAccount Should return false if account and agent are the same", () => {
    const account = {
      id: 1,
    } as IUserBase;
    const agent = {
      id: 1,
    } as IUserBase;
    const req = {
      body: { account },
    };
    const result = validateAgentDifFromAccount(agent, {
      req,
    } as unknown as Meta);
    expect(result).to.be.false;
  });

  it("toSchedule Should return a schedule if found", async () => {
    const scheduleId = "XXXXSSSSQQQQQ1111111";
    const schedule = {
      id: scheduleId,
    } as IScheduleBase;
    const getById = sandbox
      .stub(scheduleModuleMock.service, "getById")
      .resolves(schedule);

    const validation = toSchedule(scheduleModuleMock.service);

    const result = await validation(scheduleId);
    expect(getById.calledWith(scheduleId)).to.be.true;
    expect(result).to.be.deep.equal(schedule);
  });

  it("toSchedule Should return false when scheduleId is empty", async () => {
    const scheduleId = "";
    const schedule = null;
    const getById = sandbox
      .stub(scheduleModuleMock.service, "getById")
      .resolves(schedule);

    const validation = toSchedule(scheduleModuleMock.service);

    const result = await validation(scheduleId);
    expect(getById.notCalled).to.be.true;
    expect(result).to.be.false;
  });

  it("validateSchedule Should return true if a schedule is found", async () => {
    const scheduleId = "XXXXSSSSQQQQQ1111111";
    const schedule = {
      id: scheduleId,
    } as IScheduleBase;
    const getById = sandbox
      .stub(scheduleModuleMock.service, "getById")
      .resolves(schedule);

    const validation = validateSchedule(scheduleModuleMock.service);

    const result = await validation(scheduleId);
    expect(getById.calledWith(scheduleId)).to.be.true;
    expect(result).to.be.true;
  });

  it("validateSchedule Should return false if a schedule is not found", async () => {
    const scheduleId = "XXXXSSSSQQQQQ1111111";
    const schedule = null;
    const getById = sandbox
      .stub(scheduleModuleMock.service, "getById")
      .resolves(schedule);

    const validation = validateSchedule(scheduleModuleMock.service);

    const result = await validation(scheduleId);
    expect(getById.calledWith(scheduleId)).to.be.true;
    expect(result).to.be.false;
  });
});
