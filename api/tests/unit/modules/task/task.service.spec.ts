import { expect } from "chai";
import sinon from "sinon";
import {
  taskService,
  ITaskRepository,
  ITaskService,
  ITaskResult,
  ITaskQueryRequest,
} from "../../../../src/modules/task";
import { IUserBase } from "../../../../src/modules/user";
import { IScheduleBase } from "../../../../src/modules/schedule";
import { TaskType } from "@prisma/client";

const sandbox = sinon.createSandbox();

describe("taskService", () => {
  let taskServiceInstance: ITaskService;
  let taskRepositoryMock: ITaskRepository;
  beforeEach(() => {
    taskRepositoryMock = {
      create: () => null,
      update: () => null,
      delete: () => null,
      getById: () => null,
      query: () => null,
    } as unknown as ITaskRepository;
    taskServiceInstance = taskService(taskRepositoryMock);
  });

  afterEach(() => sandbox.restore());

  it("taskServiceInstance.create Should create an task", async () => {
    const taskId = "!SDGFD##@$5687883921fda";
    const scheduleId = "1223213!SDGFD##@$5687883921fda";
    const account = {
      id: 1,
    } as IUserBase;
    const schedule = { id: scheduleId } as IScheduleBase;
    const currentDate = new Date();
    const startTime = currentDate;
    const request = {
      startTime,
      duration: 3600,
      type: "work" as TaskType,
    };
    const task: ITaskResult = {
      id: taskId,
      scheduleId: scheduleId,
      type: request.type,
      accountId: account.id,
      duration: request.duration,
      startTime: request.startTime,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };

    const create = sandbox.stub(taskRepositoryMock, "create").resolves(task);
    const result = await taskServiceInstance.create(account, schedule, request);

    expect(
      create.calledWith({
        accountId: account.id,
        scheduleId: schedule.id,
        startTime: request.startTime,
        duration: request.duration,
        type: request.type,
      })
    ).to.be.true;
    expect(result).to.deep.equal(task);
  });

  it("taskServiceInstance.update Should update a task", async () => {
    const taskId = "!SDGFD##@$5687883921fda";
    const scheduleId = "1223213!SDGFD##@$5687883921fda";
    const account = {
      id: 1,
    } as IUserBase;
    const schedule = { id: scheduleId } as IScheduleBase;
    const currentDate = new Date();
    const startTime = currentDate;
    const request = {
      schedule,
      startTime,
      duration: 3600,
      type: "work" as TaskType,
    };
    const task: ITaskResult = {
      id: taskId,
      scheduleId: scheduleId,
      type: request.type,
      accountId: account.id,
      duration: request.duration,
      startTime: request.startTime,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };

    const update = sandbox.stub(taskRepositoryMock, "update").resolves(task);
    const result = await taskServiceInstance.update(
      taskId,
      account,
      schedule,
      request
    );

    expect(
      update.calledWith(taskId, {
        accountId: account.id,
        scheduleId: schedule.id,
        startTime: request.startTime,
        duration: request.duration,
        type: request.type,
      })
    ).to.be.true;
    expect(result).to.deep.equal(task);
  });

  it("taskServiceInstance.delete Should delete a task and return true", async () => {
    const taskId = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox.stub(taskRepositoryMock, "delete");
    const result = await taskServiceInstance.delete(taskId);
    expect(deleteMethod.calledWith(taskId)).to.be.true;
    expect(result).to.be.true;
  });

  it("taskServiceInstance.delete Should not delete a task and return false", async () => {
    const taskId = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox.stub(taskRepositoryMock, "delete").throws();
    const result = await taskServiceInstance.delete(taskId);
    expect(deleteMethod.calledWith(taskId)).to.be.true;
    expect(result).to.be.false;
  });

  it("taskServiceInstance.getById Should return a task", async () => {
    const taskId = "!SDGFD##@$5687883921fda";
    const scheduleId = "1223213!SDGFD##@$5687883921fda";
    const account = {
      id: 1,
    } as IUserBase;
    const schedule = { id: scheduleId };
    const currentDate = new Date();
    const startTime = currentDate;
    const request = {
      startTime,
      duration: 3600,
      type: "work" as TaskType,
    };
    const task: ITaskResult = {
      id: taskId,
      scheduleId: scheduleId,
      type: request.type,
      accountId: account.id,
      duration: request.duration,
      startTime: request.startTime,
      createdAt: currentDate,
      deletedAt: null,
      updatedAt: currentDate,
    };
    const getById = sandbox.stub(taskRepositoryMock, "getById").resolves(task);
    const result = await taskServiceInstance.getById(taskId);
    expect(getById.calledWith(taskId)).to.be.true;
    expect(result).to.deep.equal(task);
  });

  it("taskServiceInstance.verifyConflictingAppointments Should return true when there is cloflic", async () => {
    const accountId = 1;
    const taskId = "!SDGFD##@$5687883921fda";
    const scheduleId = "1223213!SDGFD##@$5687883921fda";
    const account = {
      id: accountId,
    } as IUserBase;
    const schedule = {
      id: scheduleId,
    } as IScheduleBase;
    const startTime = new Date("2024-08-10T00:00:00");
    const duration = 3600;
    const task = {
      id: taskId,
      accountId: account.id,
      scheduleId: scheduleId,
      duration,
      startTime: startTime,
    } as ITaskResult;

    const query = sandbox.stub(taskRepositoryMock, "query").resolves([task]);
    const result = await taskServiceInstance.verifyConflictingAppointments(
      schedule,
      startTime,
      duration
    );

    expect(
      query.calledWith(
        { scheduleId: schedule.id },
        { startTime: true, duration: true }
      )
    ).to.be.true;
    expect(result).to.be.true;
  });

  it("taskServiceInstance.verifyConflictingAppointments Should return false when there is not cloflic", async () => {
    const accountId = 1;
    const taskId = "!SDGFD##@$5687883921fda";
    const scheduleId = "1223213!SDGFD##@$5687883921fda";
    const account = {
      id: accountId,
    } as IUserBase;
    const schedule = {
      id: scheduleId,
    } as IScheduleBase;
    const startTime = new Date("2024-08-10T00:00:00");
    const duration = 3600;
    const task = {
      id: taskId,
      accountId: account.id,
      scheduleId: scheduleId,
      duration,
      startTime: new Date("2024-08-10T01:00:00"),
    } as ITaskResult;

    const query = sandbox.stub(taskRepositoryMock, "query").resolves([task]);
    const result = await taskServiceInstance.verifyConflictingAppointments(
      schedule,
      startTime,
      duration
    );

    expect(
      query.calledWith(
        { scheduleId: schedule.id },
        { startTime: true, duration: true }
      )
    ).to.be.true;
    expect(result).to.be.false;
  });

  it("taskServiceInstance.isTaskInScheduleRange Should return true when appointment is in the range of the schedule", async () => {
    const schedule = {
      startTime: new Date("2024-08-10T00:00:00"),
      endTime: new Date("2024-08-10T18:30:00"),
    } as IScheduleBase;
    const startTime = new Date("2024-08-10T01:00:00");
    const duration = 3600;
    const result = await taskServiceInstance.isTaskInScheduleRange(
      schedule,
      startTime,
      duration
    );
    expect(result).to.be.true;
  });

  it("taskServiceInstance.isTaskInScheduleRange Should return false when appointment is not in the range of the schedule", async () => {
    const schedule = {
      startTime: new Date("2024-08-10T00:00:00"),
      endTime: new Date("2024-08-10T18:30:00"),
    } as IScheduleBase;
    const startTime = new Date("2024-08-10T18:00:00");
    const duration = 3600;
    const result = await taskServiceInstance.isTaskInScheduleRange(
      schedule,
      startTime,
      duration
    );
    expect(result).to.be.false;
  });

  it("taskServiceInstance.filter Should filter by the beginning and the end of the current date", async () => {
    const request = {
      startTime: new Date("2024-08-10"),
      type: "work",
    } as ITaskQueryRequest;

    const beginning = new Date("2024-08-10T00:00:00");
    const end = new Date("2024-08-10T23:59:59");
    const resultExpected = [] as ITaskResult[];
    const query = sandbox
      .stub(taskRepositoryMock, "query")
      .resolves(resultExpected);

    const result = await taskServiceInstance.filter(request);

    expect(
      query.calledWith({
        type: request.type,
        startTime: {
          gte: beginning,
          lte: end,
        },
      })
    );
    expect(result).to.be.equal(resultExpected);
  });
});
