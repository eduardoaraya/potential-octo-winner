import { expect } from "chai";
import sinon from "sinon";
import { PrismaClient } from "@prisma/client";
import {
  IUserController,
  IUserResult,
  IUserModule,
  userModule,
} from "../../../../src/modules/user";
import httpMocks from "node-mocks-http";
import { StatusCodes } from "http-status-codes";
import { userController } from "../../../../src/app/controllers/user.controller";

const sandbox = sinon.createSandbox();

describe("userController", () => {
  let userControllerInstance: IUserController;
  let useModuleMock: IUserModule;

  beforeEach(() => {
    const connection = sandbox.createStubInstance(PrismaClient);
    useModuleMock = userModule(connection);
    userControllerInstance = userController(useModuleMock);
  });

  afterEach(() => sandbox.restore());

  it("userController.getById: Should return a status code 404 when the user wasn't found", async () => {
    const userId = 1;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus");
    const getById = sandbox.stub(useModuleMock.service, "getById");
    getById.resolves(null);

    await userControllerInstance.getById(req, res);

    expect(
      getById.calledWith(userId),
      "service.getById Should be called with userId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.NOT_FOUND),
      "res.sendStatus Should be called with StatusCodes.NOT_FOUND"
    ).to.be.true;
  });

  it("userController.getById: Should return a user when was found", async () => {
    const userId = 1;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();
    const user = {
      id: userId,
      name: "User",
      email: "user@mail.com",
    };

    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send");
    const getById = sandbox.stub(useModuleMock.service, "getById");
    getById.resolves(user);

    await userControllerInstance.getById(req, res);

    expect(
      getById.calledWith(userId),
      "service.getById Should be called with userId"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.OK),
      "res.sendStatus Should be called with StatusCodes.OK"
    ).to.be.true;
    expect(
      send.calledWith({ user }),
      "res.send Should be called with the user returned"
    ).to.be.true;
  });

  it("userController.getById: return a response errrr when userId was invalid", async () => {
    const userId = Number.MAX_SAFE_INTEGER;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();
    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();
    const errorExpected = {
      error: "Invalid userId!",
    };

    await userControllerInstance.getById(req, res);

    expect(
      status.calledWith(StatusCodes.PRECONDITION_FAILED),
      "res.status Should be called with StatusCodes.PRECONDITION_FAILED"
    ).to.be.true;
    expect(
      send.calledWith(errorExpected),
      "res.send Should be called when userId was invalid"
    ).to.be.true;
  });

  it("userController.delete: Should call a service method to delete a user by the userId", async () => {
    const userId = 1;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();
    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(useModuleMock.service, "delete");
    serviceDelete.resolves(true);

    await userControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(userId),
      "service.delete Should be called with userId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("userController.delete return a response error when delete was not done", async () => {
    const userId = 1;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();

    const sendStatus = sandbox.stub(res, "sendStatus").returnsThis();
    const serviceDelete = sandbox.stub(useModuleMock.service, "delete");
    serviceDelete.resolves(false);

    await userControllerInstance.delete(req, res);

    expect(
      serviceDelete.calledWith(userId),
      "service.delete Should be called with userId"
    ).to.be.true;
    expect(
      sendStatus.calledWith(StatusCodes.NOT_ACCEPTABLE),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("userController.delete return a response error when was an userId invalid", async () => {
    const userId = Number.MAX_SAFE_INTEGER;
    const req = httpMocks.createRequest({
      params: { userId },
    });
    const res = httpMocks.createResponse();
    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();
    const errorExpected = {
      error: "Invalid userId!",
    };

    await userControllerInstance.delete(req, res);

    expect(
      status.calledWith(StatusCodes.PRECONDITION_FAILED),
      "service.delete Should be called with StatusCodes.PRECONDITION_FAILED"
    ).to.be.true;
    expect(
      send.calledWith(errorExpected),
      "res.send Should be called when userId was invalid"
    ).to.be.true;
  });

  it("userController.update: Should update an user with the correct arguments", async () => {
    const userId = 1;
    const user = { id: userId, name: "Test", email: "test@mail.com" };
    const req = httpMocks.createRequest({
      body: { userId, name: "Test", email: "test@mail.com" },
    });
    const res = httpMocks.createResponse();

    const status = sandbox.stub(res, "status").returnsThis();
    const update = sandbox.stub(useModuleMock.service, "update");
    update.resolves(user);

    await userControllerInstance.update(req, res);

    expect(
      update.calledWith(userId, {
        name: user.name,
        email: user.email,
      }),
      "service.getById Should be called with userId and user data"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.ACCEPTED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("userController.create: Should create an user with the correct arguments", async () => {
    const body = { name: "Test", email: "test@mail.com" };
    const req = httpMocks.createRequest({ body });
    const res = httpMocks.createResponse();

    const status = sandbox.stub(res, "status").returnsThis();
    const create = sandbox.stub(useModuleMock.service, "create");
    create.resolves();

    await userControllerInstance.create(req, res);

    expect(
      create.calledWith(body),
      "service.create Should be called with body request"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.CREATED),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
  });

  it("userController.filter: Should apply a filter with the query", async () => {
    const query = { name: "Test", email: "test@mail.com" };
    const req = httpMocks.createRequest({ query });
    const res = httpMocks.createResponse();
    const filterResult: IUserResult[] = [];
    const status = sandbox.stub(res, "status").returnsThis();
    const send = sandbox.stub(res, "send").returnsThis();
    const filter = sandbox.stub(useModuleMock.service, "filter");
    filter.resolves(filterResult);

    await userControllerInstance.filter(req, res);

    expect(
      filter.calledWith(query),
      "service.filter Should be called with query request"
    ).to.be.true;
    expect(
      status.calledWith(StatusCodes.OK),
      "res.sendStatus Should be called with StatusCodes.ACCEPTED"
    ).to.be.true;
    expect(
      send.calledWith(filterResult),
      "res.send Should be called filter result"
    ).to.be.true;
  });
});
