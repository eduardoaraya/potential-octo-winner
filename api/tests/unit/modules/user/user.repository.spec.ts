import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";

import {
  userRepository,
  IUserRepository,
  IUserQueryRequest,
  IUserSelect,
  IUserCreateRequest,
  IUserUpdateRequest,
} from "../../../../src/modules/user";

const sandbox = sinon.createSandbox();

describe("userRepository", () => {
  let userRepositoryInstance: IUserRepository;
  let connectionMock: PrismaClient;
  beforeEach(async () => {
    connectionMock = {
      user: {
        findUnique: () => null,
        create: () => null,
        update: () => null,
        delete: () => null,
        findMany: () => null,
      },
    } as unknown as PrismaClient;
    userRepositoryInstance = userRepository(connectionMock);
  });

  afterEach(() => sandbox.restore());

  it("userRepository.query", async () => {
    const where = {} as IUserQueryRequest;
    const select = {} as IUserSelect;
    const findMany = sandbox.stub(connectionMock.user, "findMany");
    await userRepositoryInstance.query(where, select);
    expect(findMany.calledWith({ where, select })).to.be.true;
    expect(findMany.calledOnce).to.be.true;
  });

  it("userRepository.create", async () => {
    const data = {} as IUserCreateRequest;
    const select = {} as IUserSelect;
    const create = sandbox.stub(connectionMock.user, "create");
    await userRepositoryInstance.create(data, select);
    expect(create.calledWith({ data, select })).to.be.true;
    expect(create.calledOnce).to.be.true;
  });

  it("userRepository.update", async () => {
    const id = 1;
    const data = {} as IUserUpdateRequest;
    const select = {} as IUserSelect;
    const update = sandbox.stub(connectionMock.user, "update");
    await userRepositoryInstance.update(id, data, select);
    expect(update.calledWith({ data, where: { id }, select })).to.be.true;
    expect(update.calledOnce).to.be.true;
  });

  it("userRepository.delete", async () => {
    const id = 1;
    const deleteMethod = sandbox.stub(connectionMock.user, "delete");
    await userRepositoryInstance.delete(id);
    expect(deleteMethod.calledWith({ where: { id } })).to.be.true;
    expect(deleteMethod.calledOnce).to.be.true;
  });

  it("userRepository.getById", async () => {
    const id = 1;
    const select: IUserSelect = {};
    const findUnique = sandbox.stub(connectionMock.user, "findUnique");
    await userRepositoryInstance.getById(id, select);
    expect(findUnique.calledWith({ where: { id }, select })).to.be.true;
    expect(findUnique.calledOnce).to.be.true;
  });
});
