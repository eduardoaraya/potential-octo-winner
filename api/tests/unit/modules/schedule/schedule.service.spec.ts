import { expect } from "chai";
import sinon from "sinon";
import {
  scheduleService,
  IScheduleRepository,
  IScheduleService,
  IScheduleResult,
} from "../../../../src/modules/schedule";
import { IUserBase } from "../../../../src/modules/user";

const sandbox = sinon.createSandbox();

describe("scheduleService", () => {
  let scheduleServiceInstance: IScheduleService;
  let scheduleRepositoryMock: IScheduleRepository;
  beforeEach(() => {
    scheduleRepositoryMock = {
      create: () => null,
      update: () => null,
      delete: () => null,
      getById: () => null,
      query: () => null,
    } as unknown as IScheduleRepository;
    scheduleServiceInstance = scheduleService(scheduleRepositoryMock);
  });

  afterEach(() => sandbox.restore());

  it("scheduleServiceInstance.create Should create an schedule", async () => {
    const scheduleId = "!SDGFD##@$5687883921fda";
    const account = {
      id: 1,
    } as IUserBase;
    const agent = {
      id: 2,
    } as IUserBase;
    const currentDate = new Date();
    const startTime = currentDate;
    const endTime = currentDate;
    const request = {
      startTime,
      endTime,
    };
    const schedule: IScheduleResult = {
      id: scheduleId,
      agentId: account.id,
      accountId: agent.id,
      startTime: startTime,
      endTime: endTime,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };

    const create = sandbox
      .stub(scheduleRepositoryMock, "create")
      .resolves(schedule);
    const result = await scheduleServiceInstance.create(
      account,
      agent,
      request
    );

    expect(
      create.calledWith({
        accountId: account.id,
        agentId: agent.id,
        startTime,
        endTime,
      })
    ).to.be.true;
    expect(result).to.deep.equal(schedule);
  });

  it("scheduleServiceInstance.update Should update a schedule", async () => {
    const scheduleId = "!SDGFD##@$5687883921fda";
    const currentDate = new Date();
    const account = {
      id: 1,
    } as IUserBase;
    const agent = {
      id: 2,
    } as IUserBase;
    const startTime = currentDate;
    const endTime = currentDate;
    const request = {
      startTime,
      endTime,
    };
    const schedule: IScheduleResult = {
      agentId: account.id,
      accountId: agent.id,
      id: scheduleId,
      startTime: startTime,
      endTime: endTime,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const update = sandbox
      .stub(scheduleRepositoryMock, "update")
      .resolves(schedule);

    const result = await scheduleServiceInstance.update(
      scheduleId,
      account,
      agent,
      request
    );

    expect(
      update.calledWith(scheduleId, {
        accountId: account.id,
        agentId: agent.id,
        startTime,
        endTime,
      })
    ).to.be.true;
    expect(result).to.deep.equal(schedule);
  });

  it("scheduleServiceInstance.delete Should delete a schedule and return true", async () => {
    const scheduleId = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox.stub(scheduleRepositoryMock, "delete");
    const result = await scheduleServiceInstance.delete(scheduleId);
    expect(deleteMethod.calledWith(scheduleId)).to.be.true;
    expect(result).to.be.true;
  });

  it("scheduleServiceInstance.delete Should not delete a schedule and return false", async () => {
    const scheduleId = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox
      .stub(scheduleRepositoryMock, "delete")
      .throws();
    const result = await scheduleServiceInstance.delete(scheduleId);
    expect(deleteMethod.calledWith(scheduleId)).to.be.true;
    expect(result).to.be.false;
  });

  it("scheduleServiceInstance.getById Should return a schedule", async () => {
    const scheduleId = "!SDGFD##@$5687883921fda";
    const currentDate = new Date();
    const schedule: IScheduleResult = {
      agentId: 1,
      accountId: 2,
      id: scheduleId,
      startTime: currentDate,
      endTime: currentDate,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const getById = sandbox
      .stub(scheduleRepositoryMock, "getById")
      .resolves(schedule);
    const result = await scheduleServiceInstance.getById(scheduleId);
    expect(getById.calledWith(scheduleId)).to.be.true;
    expect(result).to.deep.equal(schedule);
  });

  it("scheduleServiceInstance.verifyConflictingAppointments Should return false when there is empty result", async () => {
    const userId = 1;
    const user = { id: userId } as IUserBase;
    const startTime = new Date("2024-08-10T00:00:00");
    const endTime = new Date("2024-08-10T01:00:00");

    const betweenDates = {
      lte: endTime,
      gte: startTime,
    };
    const query = sandbox.stub(scheduleRepositoryMock, "query").resolves([]);

    const result = await scheduleServiceInstance.verifyConflictingAppointments(
      user,
      startTime,
      endTime
    );
    expect(
      query.calledWith({
        OR: [
          {
            accountId: user.id,
            startTime: betweenDates,
          },
          {
            accountId: user.id,
            endTime: betweenDates,
          },
        ],
      })
    ).to.be.true;
    expect(result).to.be.false;
  });

  it("scheduleServiceInstance.verifyConflictingAppointments Should return true when there is content", async () => {
    const userId = 1;
    const user = { id: userId } as IUserBase;
    const startTime = new Date("2024-08-10T00:00:00");
    const endTime = new Date("2024-08-10T01:00:00");

    const currentDate = new Date();
    const betweenDates = {
      lte: endTime,
      gte: startTime,
    };

    const query = sandbox.stub(scheduleRepositoryMock, "query").resolves([
      {
        id: "12312QWEQ!@#@!",
        accountId: user.id,
        agentId: 2,
        startTime,
        endTime: endTime,
        updatedAt: currentDate,
        createdAt: currentDate,
        deletedAt: currentDate,
      },
    ]);

    const result = await scheduleServiceInstance.verifyConflictingAppointments(
      user,
      startTime,
      endTime
    );

    expect(
      query.calledWith({
        OR: [
          {
            accountId: user.id,
            startTime: betweenDates,
          },
          {
            accountId: user.id,
            endTime: betweenDates,
          },
        ],
      })
    ).to.be.true;
    expect(result).to.be.true;
  });

  it("scheduleServiceInstance.filter Should return a schedule when content is found", async () => {
    const accountId = 1;
    const agentId = 2;
    const account = { id: accountId } as IUserBase;
    const agent = { id: agentId } as IUserBase;
    const startTime = new Date("2024-08-10T00:00:00");
    const endTime = new Date("2024-08-10T01:00:00");

    const currentDate = new Date();
    const betweenDates = {
      lte: endTime,
      gte: startTime,
    };
    const expectedResult = [
      {
        id: "12312QWEQ!@#@!",
        accountId: account.id,
        agentId: agent.id,
        startTime,
        endTime,
        updatedAt: currentDate,
        createdAt: currentDate,
        deletedAt: currentDate,
      },
    ];

    const query = sandbox
      .stub(scheduleRepositoryMock, "query")
      .resolves(expectedResult);

    const result = await scheduleServiceInstance.filter({
      accountId,
      agentId,
      startTime,
      endTime,
    });

    expect(
      query.calledWith({
        OR: [
          { accountId: Number.isNaN(accountId) ? undefined : accountId },
          { agentId: Number.isNaN(agentId) ? undefined : agentId },
          { startTime: betweenDates },
          { endTime: betweenDates },
        ],
      })
    ).to.be.true;
    expect(result).to.be.deep.equal(expectedResult);
  });
});
