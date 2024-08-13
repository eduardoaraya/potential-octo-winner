import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";
import {
  scheduleModule,
  IScheduleController,
  IScheduleModule,
  IScheduleBase,
} from "../../../../src/modules/schedule";
import { IUserBase } from "../../../../src/modules/user";
import { scheduleController } from "../../../../src/app/controllers/index";
import httpMocks from "node-mocks-http";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

const sandbox = sinon.createSandbox();

describe("scheduleController", () => {
  let scheduleControllerInstance: IScheduleController;
  let scheduleModuleMock: IScheduleModule;

  beforeEach(async () => {
    const connection = sandbox.createStubInstance(PrismaClient);
    scheduleModuleMock = scheduleModule(connection);
    scheduleControllerInstance = scheduleController(scheduleModuleMock);
  });

  afterEach(() => sandbox.restore());

  it("scheduleController.getById: Should return a status code 404 when the schedule wasn't found", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { scheduleId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus");
    const getById = sandbox.stub(scheduleModuleMock.service, "getById");
    getById.resolves(null);

    await scheduleControllerInstance.getById(req, res);

    expect(
      getById.calledWith(scheduleId),
      "service.getById Should be called with scheduleId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.NOT_FOUND),
      "res.sendStatus Should be called with StatusCodes.NOT_FOUND"
    ).to.be.true;
  });

  it("scheduleController.getById: Should return a schedule when was found", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const req = httpMocks.createRequest({
      params: { scheduleId },
    });
    const res = httpMocks.createResponse();
    const schedule: IScheduleBase = {
      id: scheduleId,
      accountId: 1,
      agentId: 2,
      startTime: currentDate,
      endTime: currentDate,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send");
    const getById = sandbox.stub(scheduleModuleMock.service, "getById");
    getById.resolves(schedule);

    await scheduleControllerInstance.getById(req, res);

    expect(
      getById.calledWith(scheduleId),
      "service.getById Should be called with scheduleId"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.OK),
      "res.sendStatus Should be called with StatusCodes.OK"
    ).to.be.true;
    expect(
      send.calledWith({ schedule }),
      "res.send Should be called with the schedule returned"
    ).to.be.true;
  });

  it("scheduleController.delete: Should call a service method to delete a schedule by the scheduleId", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { scheduleId },
    });
    const res = httpMocks.createResponse();
    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(scheduleModuleMock.service, "delete");
    serviceDelete.resolves(true);

    await scheduleControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(scheduleId),
      "service.delete Should be called with scheduleId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("scheduleController.delete return a response error when delete was not done", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const req = httpMocks.createRequest({
      params: { scheduleId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(scheduleModuleMock.service, "delete");
    serviceDelete.resolves(true);

    await scheduleControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(scheduleId),
      "service.delete Should be called with scheduleId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("scheduleController.update: Should update a schedule with the correct arguments", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const accountId = 1;
    const agentId = 2;
    const body = {
      startTime: currentDate,
      endTime: currentDate,
      agent: {
        id: agentId,
      },
      schedule: {
        id: scheduleId,
        accountId: accountId,
      },
    };
    const schedule: IScheduleBase = {
      id: scheduleId,
      accountId,
      agentId,
      startTime: currentDate,
      endTime: currentDate,
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
      .stub(scheduleModuleMock.userService, "getById")
      .resolves({ id: accountId } as IUserBase);

    const verifyConflictingAppointments = sandbox
      .stub(scheduleModuleMock.service, "verifyConflictingAppointments")
      .resolves(false);

    const update = sandbox
      .stub(scheduleModuleMock.service, "update")
      .resolves(schedule);

    await scheduleControllerInstance.update(req, res);
    expect(
      update.calledWith(
        scheduleId,
        { id: accountId },
        { id: agentId },
        {
          startTime: body.startTime,
          endTime: body.endTime,
        }
      ),
      "service.update Should be called with the correct arguments"
    ).to.be.true;
    expect(
      accountGetById.calledWith(accountId),
      "userService.getById Should be called by the accountId"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      send.calledWith({ schedule }),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.calledTwice,
      "service.verifyConflictingAppointments Should be called 2x"
    ).to.be.true;
  });

  it("scheduleController.update: Should not update a schedule with conflicting appointments", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const accountId = 1;
    const agentId = 2;
    const body = {
      startTime: currentDate,
      endTime: currentDate,
      agent: {
        id: agentId,
      },
      schedule: {
        id: scheduleId,
        accountId: accountId,
      },
    };
    const schedule: IScheduleBase = {
      id: scheduleId,
      accountId,
      agentId,
      startTime: currentDate,
      endTime: currentDate,
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
      .stub(scheduleModuleMock.userService, "getById")
      .resolves({ id: accountId } as IUserBase);

    const verifyConflictingAppointments = sandbox
      .stub(scheduleModuleMock.service, "verifyConflictingAppointments")
      .resolves(true);

    const update = sandbox
      .stub(scheduleModuleMock.service, "update")
      .resolves(schedule);

    await scheduleControllerInstance.update(req, res);
    expect(update.notCalled, "service.update Should not be called").to.be.true;
    expect(
      accountGetById.calledWith(accountId),
      "userService.getById Should be called by the accountId"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.NOT_ACCEPTABLE),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      send.calledWith({ error: "There are conflicting commitments!" }),
      "res.sendStatus Should be called with error message"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.calledTwice,
      "service.verifyConflictingAppointments Should be called 2x"
    ).to.be.true;
  });

  it("scheduleController.create: Should update a schedule with the correct arguments", async () => {
    const scheduleId = "0D456A123125BA1234BASDW";
    const currentDate = new Date();
    const accountId = 1;
    const agentId = 2;
    const body = {
      startTime: currentDate,
      endTime: currentDate,
      account: {
        id: accountId,
      },
      agent: {
        id: agentId,
      },
      schedule: {
        id: scheduleId,
        accountId: accountId,
      },
    };
    const schedule: IScheduleBase = {
      id: scheduleId,
      accountId,
      agentId,
      startTime: currentDate,
      endTime: currentDate,
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

    const verifyConflictingAppointments = sandbox
      .stub(scheduleModuleMock.service, "verifyConflictingAppointments")
      .resolves(false);

    const create = sandbox
      .stub(scheduleModuleMock.service, "create")
      .resolves(schedule);

    await scheduleControllerInstance.create(req, res);

    expect(
      create.calledWith(
        { id: accountId },
        { id: agentId },
        {
          startTime: body.startTime,
          endTime: body.endTime,
        }
      ),
      "service.create Should be called with the correct arguments"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.CREATED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      send.calledWith({ schedule }),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      verifyConflictingAppointments.calledTwice,
      "service.verifyConflictingAppointments Should be called 2x"
    ).to.be.true;
  });
});
