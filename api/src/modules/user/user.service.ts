import {
  IUserRepository,
  IUserBase,
  IUserCreateRequest,
  IUserUpdateRequest,
  IUserQueryRequest,
  IUserService,
  IUserSelect,
} from "./user.contracts";

export function userService(repository: IUserRepository): IUserService {
  return {
    async filter({
      email,
      name,
    }: Pick<IUserQueryRequest, "email" | "name">): Promise<IUserBase[]> {
      return repository.query({
        OR: [{ email }, { name }],
      });
    },
    async create(request: IUserCreateRequest): Promise<IUserBase> {
      return repository.create(request, { name: true, email: true });
    },
    async update(
      userId: number,
      request: IUserUpdateRequest
    ): Promise<IUserBase> {
      return repository.update(userId, request, { name: true, email: true });
    },
    async delete(userId: number): Promise<boolean> {
      try {
        await repository.delete(userId);
        return true;
      } catch {
        return false;
      }
    },
    async getById(
      userId: number,
      select?: IUserSelect
    ): Promise<IUserBase | null> {
      return repository.getById(userId, select);
    },
  };
}
