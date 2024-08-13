import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";
import {
  taskModule,
  ITaskModule,
  toTask,
  validateTask,
  ITaskBase,
} from "../../../../src/modules/task";
import { IUserBase } from "../../../../src/modules/user";

import { Meta } from "express-validator";

const sandbox = sinon.createSandbox();

describe("Task validators", () => {
  let taskModuleMock: ITaskModule;

  beforeEach(async () => {
    const connection = sandbox.createStubInstance(PrismaClient);
    taskModuleMock = taskModule(connection);
  });

  afterEach(() => sandbox.restore());

  it("toTask Should return a task if found", async () => {
    const taskId = "XXXXSSSSQQQQQ1111111";
    const task = {
      id: taskId,
    } as ITaskBase;
    const getById = sandbox
      .stub(taskModuleMock.service, "getById")
      .resolves(task);

    const validation = toTask(taskModuleMock.service);

    const result = await validation(taskId);
    expect(getById.calledWith(taskId)).to.be.true;
    expect(result).to.be.deep.equal(task);
  });

  it("toTask Should return a false if taskId is empty", async () => {
    const taskId = "";
    const getById = sandbox.stub(taskModuleMock.service, "getById");

    const validation = toTask(taskModuleMock.service);

    const result = await validation(taskId);
    expect(getById.notCalled).to.be.true;
    expect(result).to.be.false;
  });

  it("validateTask Should return true if found", async () => {
    const taskId = "XXXXSSSSQQQQQ1111111";
    const task = {
      id: taskId,
    } as ITaskBase;
    const getById = sandbox
      .stub(taskModuleMock.service, "getById")
      .resolves(task);

    const validation = validateTask(taskModuleMock.service);

    const result = await validation(taskId);
    expect(getById.calledWith(taskId)).to.be.true;
    expect(result).to.be.true;
  });

  it("validateTask Should return true if found", async () => {
    const taskId = "XXXXSSSSQQQQQ1111111";
    const task = null;
    const getById = sandbox
      .stub(taskModuleMock.service, "getById")
      .resolves(task);

    const validation = validateTask(taskModuleMock.service);

    const result = await validation(taskId);
    expect(getById.calledWith(taskId)).to.be.true;
    expect(result).to.be.false;
  });
});
