import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient, TaskType } from "@prisma/client";
import {
  taskModule,
  ITaskController,
  ITaskModule,
  ITaskBase,
} from "../../../../src/modules/task";
import { IUserBase } from "../../../../src/modules/user";
import { IScheduleBase } from "../../../../src/modules/schedule";
import { taskController } from "../../../../src/app/controllers/index";
import httpMocks from "node-mocks-http";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

const sandbox = sinon.createSandbox();

describe("taskController", () => {
  let taskControllerInstance: ITaskController;
  let taskModuleMock: ITaskModule;

  beforeEach(async () => {
    const connection = sandbox.createStubInstance(PrismaClient);
    taskModuleMock = taskModule(connection);
    taskControllerInstance = taskController(taskModuleMock);
  });

  afterEach(() => sandbox.restore());

  it("taskController.getById: Should return a status code 404 when the task wasn't found", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { taskId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus");
    const getById = sandbox.stub(taskModuleMock.service, "getById");
    getById.resolves(null);

    await taskControllerInstance.getById(req, res);

    expect(
      getById.calledWith(taskId),
      "service.getById Should be called with taskId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.NOT_FOUND),
      "res.sendStatus Should be called with StatusCodes.NOT_FOUND"
    ).to.be.true;
  });

  it("taskController.getById: Should return a task when was found", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const req = httpMocks.createRequest({
      params: { taskId },
    });
    const res = httpMocks.createResponse();
    const task: ITaskBase = {
      id: taskId,
      scheduleId: "0D456A123125BA1234BASDWXAS",
      accountId: 1,
      duration: 3600,
      startTime: currentDate,
      type: "work",
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send");
    const getById = sandbox.stub(taskModuleMock.service, "getById");
    getById.resolves(task);

    await taskControllerInstance.getById(req, res);

    expect(
      getById.calledWith(taskId),
      "service.getById Should be called with taskId"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.OK),
      "res.sendStatus Should be called with StatusCodes.OK"
    ).to.be.true;
    expect(
      send.calledWith({ task }),
      "res.send Should be called with the task returned"
    ).to.be.true;
  });

  it("taskController.delete: Should call a service method to delete a task by the taskId", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { taskId },
    });
    const res = httpMocks.createResponse();
    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(taskModuleMock.service, "delete");
    serviceDelete.resolves(true);

    await taskControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(taskId),
      "service.delete Should be called with taskId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("taskController.delete return a response error when delete was not done", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { taskId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(taskModuleMock.service, "delete");
    serviceDelete.resolves(true);

    await taskControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(taskId),
      "service.delete Should be called with taskId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("taskController.update: Should update a task with the correct arguments", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const scheduleId = "0D456A123125BA1234BASDWXAS";
    const accountId = 1;
    const schedule = {
      id: scheduleId,
      accountId,
    };
    const body = {
      schedule,
      duration: 3600,
      type: "work",
      startTime: currentDate,
      task: {
        id: taskId,
        accountId,
        scheduleId,
      },
    };
    const task: ITaskBase = {
      accountId,
      scheduleId,
      id: taskId,
      duration: 3600,
      startTime: currentDate,
      type: "work",
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const req = httpMocks.createRequest({
      body,
    });
    const res = httpMocks.createResponse();

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();

    const accountGetById = sandbox
      .stub(taskModuleMock.userService, "getById")
      .resolves({ id: accountId } as IUserBase);

    const isTaskInScheduleRange = sandbox
      .stub(taskModuleMock.service, "isTaskInScheduleRange")
      .resolves(true);

    const verifyConflictingAppointments = sandbox
      .stub(taskModuleMock.service, "verifyConflictingAppointments")
      .resolves(false);

    const update = sandbox
      .stub(taskModuleMock.service, "update")
      .resolves(task);

    await taskControllerInstance.update(req, res);

    expect(
      update.calledWith(taskId, { id: accountId }, schedule, {
        startTime: body.startTime,
        duration: body.duration,
        type: body.type as TaskType,
      }),
      "service.update Should be called with the correct arguments"
    ).to.be.true;
    expect(
      accountGetById.calledWith(accountId),
      "userService.getById Should be called by the accountId"
    ).to.be.true;
    expect(
      isTaskInScheduleRange.calledWith(schedule, body.startTime, body.duration),
      "service.isTaskInScheduleRange Should be called"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      send.calledWith({ task }),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.calledWith(
        schedule,
        body.startTime,
        body.duration
      ),
      "service.verifyConflictingAppointments Should be called"
    ).to.be.true;
  });

  it("taskController.update: Should not update a task with invalid account", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const scheduleId = "0D456A123125BA1234BASDWXAS";
    const accountId = 1;
    const schedule = {
      id: scheduleId,
      accountId,
    };
    const body = {
      schedule,
      duration: 3600,
      type: "work",
      startTime: currentDate,
      task: {
        id: taskId,
        accountId,
        scheduleId,
      },
    };
    const task: ITaskBase = {
      accountId,
      scheduleId,
      id: taskId,
      duration: 3600,
      startTime: currentDate,
      type: "work",
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const req = httpMocks.createRequest({
      body,
    });
    const res = httpMocks.createResponse();

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();

    const accountGetById = sandbox
      .stub(taskModuleMock.userService, "getById")
      .resolves(null);

    const isTaskInScheduleRange = sandbox
      .stub(taskModuleMock.service, "isTaskInScheduleRange")
      .resolves(true);

    const verifyConflictingAppointments = sandbox
      .stub(taskModuleMock.service, "verifyConflictingAppointments")
      .resolves(false);

    const update = sandbox
      .stub(taskModuleMock.service, "update")
      .resolves(task);

    await taskControllerInstance.update(req, res);

    expect(update.notCalled, "service.update Should not be called").to.be.true;
    expect(
      accountGetById.calledWith(accountId),
      "userService.getById Should be called by the accountId"
    ).to.be.true;
    expect(
      isTaskInScheduleRange.notCalled,
      "service.isTaskInScheduleRange Should not be called"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.PRECONDITION_FAILED),
      "res.status Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.notCalled,
      "service.verifyConflictingAppointments Should not be called"
    ).to.be.true;
    expect(
      send.calledWith({ error: "Invalid Account!" }),
      "res.send Should be called with an error message"
    ).to.be.true;
  });

  it("taskController.create: Should create a task with the correct arguments", async () => {
    const taskId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const scheduleId = "0D456A123125BA1234BASDWXAS";
    const accountId = 1;
    const schedule = {
      id: scheduleId,
      accountId,
    };
    const body = {
      schedule,
      duration: 3600,
      type: "work",
      startTime: currentDate,
      task: {
        id: taskId,
        accountId,
        scheduleId,
      },
    };
    const task: ITaskBase = {
      accountId,
      scheduleId,
      id: taskId,
      duration: 3600,
      startTime: currentDate,
      type: "work",
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const req = httpMocks.createRequest({
      body,
    });
    const res = httpMocks.createResponse();

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();

    const accountGetById = sandbox
      .stub(taskModuleMock.userService, "getById")
      .resolves({ id: accountId } as IUserBase);

    const isTaskInScheduleRange = sandbox
      .stub(taskModuleMock.service, "isTaskInScheduleRange")
      .resolves(true);

    const verifyConflictingAppointments = sandbox
      .stub(taskModuleMock.service, "verifyConflictingAppointments")
      .resolves(false);

    const create = sandbox
      .stub(taskModuleMock.service, "create")
      .resolves(task);

    await taskControllerInstance.create(req, res);

    expect(
      create.calledWith({ id: accountId }, schedule, {
        startTime: body.startTime,
        duration: body.duration,
        type: body.type as TaskType,
      }),
      "service.update Should be called with the correct arguments"
    ).to.be.true;
    expect(
      accountGetById.calledWith(accountId),
      "userService.getById Should be called by the accountId"
    ).to.be.true;
    expect(
      isTaskInScheduleRange.calledWith(schedule, body.startTime, body.duration),
      "service.isTaskInScheduleRange Should be called"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.calledWith(
        schedule,
        body.startTime,
        body.duration
      ),
      "service.verifyConflictingAppointments Should be called"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.CREATED),
      "res.sendStatus Should be called with StatusCodes.CREATED"
    ).to.be.true;
    expect(
      send.calledWith({ task }),
      "res.send Should be called with a task object"
    ).to.be.true;
  });
});
