import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";

import {
  taskRepository,
  ITaskRepository,
  ITaskQueryRequest,
  ITaskSelect,
  ITaskUpdate,
  ITaskCreate,
} from "../../../../src/modules/task";

const sandbox = sinon.createSandbox();

describe("taskRepository", () => {
  let taskRepositoryInstance: ITaskRepository;
  let connectionMock: PrismaClient;
  beforeEach(async () => {
    connectionMock = {
      task: {
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
        findMany: () => null,
      },
    } as unknown as PrismaClient;
    taskRepositoryInstance = taskRepository(connectionMock);
  });

  afterEach(() => sandbox.restore());

  it("taskRepository.query", async () => {
    const where = {} as ITaskQueryRequest;
    const select = {} as ITaskSelect;
    const findMany = sandbox.stub(connectionMock.task, "findMany");
    await taskRepositoryInstance.query(where, select);
    expect(findMany.calledWith({ where, select })).to.be.true;
    expect(findMany.calledOnce).to.be.true;
  });

  it("taskRepository.create", async () => {
    const data = {} as ITaskCreate;
    const select = {} as ITaskSelect;
    const create = sandbox.stub(connectionMock.task, "create");
    await taskRepositoryInstance.create(data, select);
    expect(create.calledWith({ data, select })).to.be.true;
    expect(create.calledOnce).to.be.true;
  });

  it("taskRepository.update", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const data = {} as ITaskUpdate;
    const select = {} as ITaskSelect;
    const update = sandbox.stub(connectionMock.task, "update");
    await taskRepositoryInstance.update(id, data, select);
    expect(update.calledWith({ data, where: { id }, select })).to.be.true;
    expect(update.calledOnce).to.be.true;
  });

  it("taskRepository.delete", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const deleteMethod = sandbox.stub(connectionMock.task, "delete");
    await taskRepositoryInstance.delete(id);
    expect(deleteMethod.calledWith({ where: { id } })).to.be.true;
    expect(deleteMethod.calledOnce).to.be.true;
  });

  it("taskRepository.getById", async () => {
    const id = "!SDGFD##@$5687883921fda";
    const select: ITaskSelect = {};
    const findUnique = sandbox.stub(connectionMock.task, "findUnique");
    await taskRepositoryInstance.getById(id, select);
    expect(findUnique.calledWith({ where: { id }, select })).to.be.true;
    expect(findUnique.calledOnce).to.be.true;
  });
});
