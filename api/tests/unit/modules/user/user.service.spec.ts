import { expect } from "chai";
import sinon from "sinon";
import {
  userService,
  IUserRepository,
  IUserService,
  IUserResult,
} from "../../../../src/modules/user";

const sandbox = sinon.createSandbox();

describe("userService", () => {
  let userServiceInstance: IUserService;
  let userRepositoryMock: IUserRepository;
  beforeEach(() => {
    userRepositoryMock = {
      create: () => null,
      update: () => null,
      delete: () => null,
      getById: () => null,
    } as unknown as IUserRepository;
    userServiceInstance = userService(userRepositoryMock);
  });

  afterEach(() => sandbox.restore());

  it("userServiceInstance.create Should create an user", async () => {
    const userId = 1;
    const user: IUserResult = {
      id: userId,
      name: "test",
      email: "test@mail.com",
    };

    const create = sandbox.stub(userRepositoryMock, "create").resolves(user);
    const result = await userServiceInstance.create({
      name: user.name,
      email: user.email,
    });

    expect(
      create.calledWith(
        {
          name: user.name,
          email: user.email,
        },
        {
          name: true,
          email: true,
        }
      )
    ).to.be.true;
    expect(result).to.deep.equal(user);
  });

  it("userServiceInstance.update Should update a user", async () => {
    const userId = 1;
    const user: IUserResult = {
      id: userId,
      name: "test",
      email: "test@mail.com",
    };

    const update = sandbox.stub(userRepositoryMock, "update").resolves(user);
    const result = await userServiceInstance.update(userId, {
      name: user.name,
      email: user.email,
    });
    expect(
      update.calledWith(userId, {
        name: user.name,
        email: user.email,
      })
    ).to.be.true;
    expect(result).to.deep.equal(user);
  });

  it("userServiceInstance.delete Should delete a user and return true", async () => {
    const userId = 1;
    const deleteMethod = sandbox.stub(userRepositoryMock, "delete");
    const result = await userServiceInstance.delete(userId);
    expect(deleteMethod.calledWith(userId)).to.be.true;
    expect(result).to.be.true;
  });

  it("userServiceInstance.delete Should not delete a user and return false", async () => {
    const userId = 1;
    const deleteMethod = sandbox.stub(userRepositoryMock, "delete").throws();
    const result = await userServiceInstance.delete(userId);
    expect(deleteMethod.calledWith(userId)).to.be.true;
    expect(result).to.be.false;
  });

  it("userServiceInstance.getById Should return a user", async () => {
    const userId = 1;
    const user: IUserResult = {
      id: userId,
      name: "test",
      email: "test@mail.com",
    };
    const getById = sandbox.stub(userRepositoryMock, "getById").resolves(user);
    const result = await userServiceInstance.getById(userId);
    expect(getById.calledWith(userId)).to.be.true;
    expect(result).to.deep.equal(user);
  });
});
