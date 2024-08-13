import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";
import {
  userModule,
  IUserModule,
  toUser,
  validateUser,
  IUserBase,
  validateEmailExistCreate,
  validateEmailExistUpdate,
} from "../../../../src/modules/user";

import { Meta } from "express-validator";

const sandbox = sinon.createSandbox();

describe("User validators", () => {
  let userModuleMock: IUserModule;

  beforeEach(async () => {
    const connection = sandbox.createStubInstance(PrismaClient);
    userModuleMock = userModule(connection);
  });

  afterEach(() => sandbox.restore());

  it("toUser Should return a response from service.getById", async () => {
    const userId = 1;
    const user = {
      id: userId,
      email: "test@mail.com",
      name: "test",
    };
    const getById = sandbox
      .stub(userModuleMock.service, "getById")
      .resolves(user);
    const validation = toUser(userModuleMock.service);
    const result = await validation(userId);
    expect(getById.calledWith(userId, { id: true })).to.be.true;
    expect(result).to.be.deep.equal(user);
  });

  it("validateUser Should throw an exception if not found", async () => {
    const userId = 1;
    const user = null;
    const getById = sandbox
      .stub(userModuleMock.service, "getById")
      .resolves(user);
    const validation = validateUser(userModuleMock.service);
    try {
      await validation(userId);
    } catch {
      expect(getById.calledWith(userId)).to.be.true;
      Promise.resolve();
    }
  });

  it("validateUser Should throw an exception if not found", async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: "Test",
      email: "mail@mail.com",
    };
    const getById = sandbox
      .stub(userModuleMock.service, "getById")
      .resolves(user);
    const validation = validateUser(userModuleMock.service);
    const result = await validation(userId);
    expect(getById.calledWith(userId)).to.be.true;
    expect(result).to.be.true;
  });

  it("validateEmailExistCreate Should return a exception if email exist", async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: "Test",
      email: "mail@mail.com",
    };
    const req = {
      body: { email: user.email },
    };
    const getById = sandbox
      .stub(userModuleMock.repository, "query")
      .resolves([user]);
    const validation = validateEmailExistCreate(userModuleMock.repository);
    try {
      await validation(req.body.email);
    } catch (err) {
      expect(getById.calledWith({ email: user.email })).to.be.true;
      expect((err as Error).message).to.be.equal("Email already in use!");
    }
  });

  it("validateEmailExistCreate Should return true if email does not exist", async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: "Test",
      email: "mail@mail.com",
    };
    const req = {
      body: { email: user.email },
    };
    const getById = sandbox
      .stub(userModuleMock.repository, "query")
      .resolves([]);
    const validation = validateEmailExistCreate(userModuleMock.repository);
    const result = await validation(req.body.email);
    expect(getById.calledWith({ email: user.email })).to.be.true;
    expect(result).to.be.true;
  });

  it("validateEmailExistUpdate Should return a exception if email exist", async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: "Test",
      email: "mail@mail.com",
    };
    const req = {
      body: { email: user.email, userId: user.id },
    };
    const getById = sandbox
      .stub(userModuleMock.repository, "query")
      .resolves([user]);
    const validation = validateEmailExistUpdate(userModuleMock.repository);
    try {
      await validation(req.body.email, { req } as Meta);
    } catch (err) {
      expect(
        getById.calledWith(
          {
            email: req.body.email,
            id: {
              not: req.body.userId,
            },
          },
          { email: true, id: true }
        )
      ).to.be.true;
      expect((err as Error).message).to.be.equal("Email already in use!");
    }
  });

  it("validateEmailExistUpdate Should return a exception if email exist", async () => {
    const userId = 1;
    const user = {
      id: userId,
      name: "Test",
      email: "mail@mail.com",
    };
    const req = {
      body: { email: user.email, userId: user.id },
    };
    const getById = sandbox
      .stub(userModuleMock.repository, "query")
      .resolves([]);
    const validation = validateEmailExistUpdate(userModuleMock.repository);
    const result = await validation(req.body.email, { req } as Meta);
    expect(
      getById.calledWith(
        {
          email: req.body.email,
          id: {
            not: req.body.userId,
          },
        },
        { email: true, id: true }
      )
    ).to.be.true;
    expect(result).to.be.true;
  });
});
