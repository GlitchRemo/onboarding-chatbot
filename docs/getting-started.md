# 🧪 Getting Started

Welcome to the project! This monorepo is powered by npm workspaces, and includes:

- Frontend: A Vue 3 application
- BFF: A Node.js backend-for-frontend (Express + Apollo Server)
- lobstash: Utility package ( will be shared accross monorepos)
- docs: Project documentation (feel free to contribute)

Lambda Functions:

- `health-check-function`: SPOC endpoint heartbeats
- `comments-export-function`: Comment export handling
- `customer-deletion-function`: Customer deletion operations
- `customer-deletion-subscriber`: Customer deletion event subscriptions

## Project Structure


Project Structure:

```shell
root/
├── 📦 package.json         # Workspace config
├── 🔒 package-lock.json     
├── ⚙️ node_modules/        # Hoisted dependencies
├── 📱 app/                  # Vue app
├── 📡 bff/                  # Node + Express + Apollo BFF
├── 🛠️ lobstash/           # Shared types/utils
├── 📚 docs/                # Documentation
├── 📤 comments-export/      # Comment export function
└── 🗑️ customer-deletion-management/ # Customer deletion management functions
```

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 22.11.0 (use [nvm](https://github.com/nvm-sh/nvm) or [nodenv](https://github.com/nodenv/nodenv) to manage Node versions)
- **npm**: Latest version (included with Node.js)
- **Git**: Latest version
- **Docker**: For running Redis and any other containerized services

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/OttoPaymentHub/lobster_calypso
cd lobster_calypso
```

### 2. Install Dependencies

Calypso uses npm workspaces in a monorepo setup, allowing you to manage multiple packages from a single root directory:

```bash
# Install all dependencies at once with npm workspaces
npm install
```

This will install dependencies for all workspaces defined in the root `package.json`, including the frontend app, BFF, and other packages. The workspace setup simplifies dependency management and allows for easier sharing of code between packages.

> [!NOTE]
> BFF and Lobstash use the same dependencies, so there should never be a node_module under app.  

If you need to add dependencies to specific workspaces, you can use:

```bash
# Add a dependency to a specific workspace
npm install package-name --workspace=app

# Add a development dependency to a specific workspace
npm install package-name --workspace=bff --save-dev

# Run scripts in specific workspaces
npm run build --workspace=app
```

### 3. Environment Configuration

Ask A dev how you get them

Create environment files for both the frontend app and BFF:

#### For the Frontend App

Create a `.env.local` file in the `app` directory:

```bash
cd app
touch .env.local
```

Add the following environment variables (adjust values as needed):

```
VITE_APP_GRAPHQL_ENDPOINT=https://qa.calypso.services.otto-payments.de/graphql
VITE_APP_WEBSOCKET_ENDPOINT=wss://qa.calypso.services.otto-payments.de/subscriptions
VITE_APP_CASS_LINK=https://cass.cccs.qa.orderprocessing.otto.de/ui
VITE_APP_ENVIRONMENT=local
PUBLIC_PATH=https://assets.qa.calypso.services.otto-payments.de
```

#### For the BFF (Backend For Frontend)

Create a `.env` file in the `bff` directory:

```bash
cd ../bff
touch .env
```

Add the following environment variables (adjust values as needed):

```
CALYPSO_FRONTEND_URL=http://localhost:8080
API_GATEWAY_CLIENT_SECRET=
KEYCLOAK_REALM=payments-calypso-dev
WORKFLOWS_SIGNING_KEY_ARN=
NOVOMIND_PASSWORD=
NOVOMIND_CLIENT_SECRET=
DISABLE_KEYCLOAK=false
```

## Development Workflow

### Start the Development Servers

#### 1. Start the BFF Server

```bash
cd bff
npm run dev
```

This will start the BFF server on port 3000 with hot reload enabled.

#### 2. Start the Frontend App

In a new terminal:

```bash
cd app
npm run serve
```

This will start the Vue.js frontend on port 8080 with hot reload enabled.


## How to debug redis

The BFF requires Redis for caching and session management. Normally, in local, it uses an in-memory redis mock.

But if you want to use an actual redis instance on local, do the following:

1. Start Redis using Docker:
```bash
docker run --name calypso-redis -p 6379:6379 -d redis:alpine
```
2. Add the following to your `.env` file in the `bff` directory:
```bash
CACHE_ENDPOINT=localhost
CACHE_PROTOCOL=redis
FORCE_USE_EXTERNAL_REDIS=true
```
3. Start/Restart the BFF server as explained above.

### Accessing the Application

Once both servers are running, you can access the application at:

- Node[http://localhost:8080](http://localhost:4080)

## Generate Type Definitions

The project uses GraphQL and requires type generation for proper TypeScript support:

1. Generate all the types for the BFF

```
npm run generate:types:graphql
npm run generate:events:useractions
```

2. Now, on the root, you can execute the following command

```
npm run generate:types:graphql
```

this will run a script 

## Running Tests

### Frontend Tests

ofc you can always use npm workspace to execute commands from the root

```bash
cd app
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

### BFF Tests

```bash
cd bff
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

## Building for Production

### Build the Frontend

```bash
cd app
npm run build
```

This will create a production build in the `app/dist` directory.

### Build the BFF

```bash
cd bff
npm run build
```

This will create a production build in the `bff/dist` directory.

## Next Steps

If you have time, please finish the documentation. If you find anything missing, reach out to a developer. Also, feel free to contribute;
you can always create a scout PR and add documentation or fix something.

