import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";

import {
  scheduleRepository,
  IScheduleRepository,
  IScheduleQueryRequest,
  IScheduleSelect,
  IScheduleCreateRequest,
  IScheduleUpdateRequest,
} from "../../../../src/modules/schedule";

const sandbox = sinon.createSandbox();

describe("scheduleRepository", () => {
  let scheduleRepositoryInstance: IScheduleRepository;
  let connectionMock: PrismaClient;
  beforeEach(async () => {
    connectionMock = {
      schedule: {
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
        findMany: () => null,
      },
    } as unknown as PrismaClient;
    scheduleRepositoryInstance = scheduleRepository(connectionMock);
  });

  afterEach(() => sandbox.restore());

  it("scheduleRepository.query", async () => {
    const where = {} as IScheduleQueryRequest;
    const select = {} as IScheduleSelect;
    const findMany = sandbox.stub(connectionMock.schedule, "findMany");
    await scheduleRepositoryInstance.query(where, select);
    expect(findMany.calledWith({ where, select })).to.be.true;
    expect(findMany.calledOnce).to.be.true;
  });

  it("scheduleRepository.create", async () => {
    const data = {} as IScheduleCreateRequest;
    const select = {} as IScheduleSelect;
    const create = sandbox.stub(connectionMock.schedule, "create");
    await scheduleRepositoryInstance.create(data, select);
    expect(create.calledWith({ data, select })).to.be.true;
    expect(create.calledOnce).to.be.true;
  });

  it("scheduleRepository.update", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const data = {} as IScheduleUpdateRequest;
    const select = {} as IScheduleSelect;
    const update = sandbox.stub(connectionMock.schedule, "update");
    await scheduleRepositoryInstance.update(id, data, select);
    expect(update.calledWith({ data, where: { id }, select })).to.be.true;
    expect(update.calledOnce).to.be.true;
  });

  it("scheduleRepository.delete", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox.stub(connectionMock.schedule, "delete");
    await scheduleRepositoryInstance.delete(id);
    expect(deleteMethod.calledWith({ where: { id } })).to.be.true;
    expect(deleteMethod.calledOnce).to.be.true;
  });

  it("scheduleRepository.getById", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const select: IScheduleSelect = {};
    const findUnique = sandbox.stub(connectionMock.schedule, "findUnique");
    await scheduleRepositoryInstance.getById(id, select);
    expect(findUnique.calledWith({ where: { id }, select })).to.be.true;
    expect(findUnique.calledOnce).to.be.true;
  });
});
