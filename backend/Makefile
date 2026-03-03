# Makefile for Crypto Dashboard Backend

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = docker exec -it backend-postgres-1 psql -U postgres -d token_tracker

# Targets
.PHONY: help up down restart logs test init-db reset-db run-eth-listener

# Default target
help:
	@echo "Available commands:"
	@echo "  make up              - Start Docker services"
	@echo "  make down            - Stop Docker services"
	@echo "  make restart         - Restart Docker services"
	@echo "  make reset-db        - Reset database (down, up, init)"
	@echo "  make init-db         - Initialize database schema"
	@echo "  make test            - Run database tests"
	@echo "  make logs            - View Docker logs"
	@echo "  make run-eth-listener - Start Ethereum listener with auto-reload"

# Docker operations
up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart: down up
	@echo "✅ Services restarted"

# Database operations
init-db:
	node src/initDb.js

test: init-db
	node src/testDb.js

reset-db: down
	@echo "🔴 Removing Docker volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "🟢 Starting Docker containers..."
	$(DOCKER_COMPOSE) up -d
	@echo "⏳ Waiting for PostgreSQL to start..."
	sleep 3
	@echo "🔧 Initializing database..."
	$(MAKE) init-db
	@echo "✅ Database reset complete!"

# Listener operations
run-eth-listener:
	nodemon src/listeners/ethereumListener.js

# Utility
logs:
	$(DOCKER_COMPOSE) logs -f

# db
db:
	$(DOCKER_EXEC)