# Schedule API
The goals of this project was to try
apply the concept of working with microservices following clean code,
design patterns, use TDD and functional programming.

- [Installation](#installation)
  - [Docker](#docker)
  - [Setup](#setup)
- [Technologies](#technologies)
- [Libs](#Libs)
- [Layered Architecture](#layered-architecture)
- [Business Rules](#business-rules)
- [Unit Tests](#unit-test)
- [API REST](#api-rest)
- [Technical Debts and Improvements](#technical-debts-and-improvements)

## Installation

### Docker 
- Rename `.env.sample` to `.env`
- Up the services: `docker-compose up`.
- The application should be running

### Setup 

- Enter in `./api` directory
- Install dependences `npm install`
- Copy and rename `.env.sample` to `./api/.env` and add yours environment variables
- Generete models with `npx prisma generate`
- Push prisma schema with `npx prisma db push`
- Build the app `npm run build`
- Run as a prod `npm run prod`

## Technologies

- Nodejs `18.20`
- Postgresql `16.3`
- Typescript `18.19.1`
- Prisma `5.17.0`
- Docker `27.0.3`

## Libs

- express
- express-validator
- @codegenie/serverless-express
- http-status-codes
- eslint
- prettier
- mocha

## Layered Architecture

### `src/modules` | `@modules/*`
Services, Repositories, Validators, Contracts and Modules builders as a singleton and also work as a DI

### `src/infra` | `@infra/*`
 - Singleton database connection
 - App Express instance
 - Http error handler
 - Log handler

### `src/bin`
 - Executables process (servers, handlers...)

### `src/app`
- `@app/controllers` Work delegation
- `@app/routes` Application routing
- `@app/bootstrap` Application bootstrap

____

## Business Rules
### User
- An user can be an **account** or an **agent**.
- The column email is unique
- An **Acount** can have many schedules
- An **Agent** can have many appointments
### Schedule
- A schedule belongs to **account** as a schedule
- A schedule belongs to **agent** as a appointment
- A schedule can have many **tasks**
- The system will validate if the schedule has conflicting whenever it is created/updated
### Task
- A task belongs to an **account**
- A task belongs to a **schedule**
- The system will validate if the task has conflicting whenever it is created/updated
- The system will validate if the task is in the startTime and endTime range of the **schedule** whenever it is created/updated

## Unit test

Execute the command to run all unit tests: 
`cd ./api` + `npm run test:unit` or using docker `docker-compose exec api npm run test:unit`  

## API REST
### `/schedules` 
`IScheduleBase`:
```ts
{
  "id": string,
  "accountId": number,
  "agentId": number,
  "startTime": datetime,
  "endTime": datetime,
  "createdAt": datetime,
  "updatedAt": datetime,
  "deletedAt": datetime | null
}
```
- #### POST:/schedules
  **payload**
  ```ts
  {
    "account": number,
    "agent": number,
    "startTime": datetime,
    "endTime": datetime
  }
    ```
  **response (status code: 201)**
  ```ts
  {
    schedule: IScheduleBase
  }
  ```
  __________
- #### PUT:/schedules
  **payload**
  ```ts
  {
    "schedule": string,
    "agent": number,
    "startTime": datetime,
    "endTime": datetime
  }
    ```
  **response (status code: 202)**
  ```ts
  {
    schedule: IScheduleBase
  }
  ```
  __________
- #### GET:/schedules
  **path:** `:scheduleId`

  **response (status code: 202)**
  ```ts
  {
    schedule: IScheduleBase
  }
  ```
  __________
- #### GET:/schedules
  **query**
  - accountId: `number`
  - agentId: `number`
  - startTime: `datetime`
  - endTime: `datetime`

  **response (status code: 202)**
  ```ts
  IScheduleBase[]
  ```
  __________
- #### DELETE:/schedules
  **path:** `:scheduleId`

  **response (status code: 202)**
  ```ts
  true
  ```

__________


### `/tasks` 
`ITaskBase`:
```ts
{
  "id": string,
  "accountId": number,
  "scheduleId": string,
  "startTime": datetime,
  "duration": number,
  "type": "work" | "break",
  "createdAt": datetime,
  "updatedAt": datetime,
  "deletedAt": datetime | null
}
```
- #### POST:/tasks
  **payload**
  ```ts
  {
    "type": "work" | "break",
    "schedule": string,
    "startTime": datetime,
    "duration": number
  }
  ```
  **response (status code: 201)**
  ```ts
  {
    task: ITaskBase
  }
  ```
  __________
- #### PUT:/tasks
  **payload**
  ```ts
  {
    "type": "work" | "break",
    "schedule": string,
    "startTime": datetime,
    "duration": number
  }
  ```
  **response (status code: 202)**
  ```ts
  {
    task: ITaskBase
  }
  ```
  __________
- #### GET:/tasks
  **params** `:taskId`

  **response (status code: 200)**
  ```ts
  {
    task: ITaskBase
  }
  ```
  __________
- #### DELETE:/tasks
  **params** `:taskId`

  **response (status code: 202)**
  ```ts
  true
  ```
  __________
- #### GET:/tasks
  **query**
  - type: `work` | `break`
  - startTime: `date` | `datetime`

  **response (status code: 200)**
  ```ts
  ITaskBase[]
  ```
__________

### `/users`
`IUserBase`:
```ts
{
  "id": string,
  "name": string,
  "email": string
}
```
- #### POST:/users
  **payload**
  ```ts
  {
    "name": string,
    "email": string
  }
  ```
  **response (status code: 201)**
  ```ts
  {
    user: IUserBase
  }
  ```
  __________
- #### PUT:/users
  **payload**
  ```ts
  {
    "id": number,
    "name": string,
    "email": string
  }
  ```
  **response (status code: 202)**
  ```ts
  {
    user: IUserBase
  }
  ```
  __________
- #### GET:/users
  **params** `:userId`

  **response (status code: 200)**
  ```ts
  {
    user: IUserBase
  }
  ```
  __________
- #### GET:/users
  **query**
  - name: `string`
  - email: `string`

  **response (status code: 200)**
  ```ts
  IUserBase[]
  ```
  __________
- #### DELETE:/users
  **params** `:userId`

  **response (status code: 202)**
  ```ts
  true
  ```
__________


## Technical Debts and Improvements

- Finalize the nodejs docker to run the service
- Implement a cache service
- Implement GraphQL
- Add an authentication
- Improve the quality of the code with more abstraction to be more scalable and remove duplicate code
