# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest
COPY . .

# NestJS default dev port (we use 3001)
EXPOSE 3001

# Run in dev mode (uses ts-node via nest scripts)
CMD ["npm", "run", "start:dev"]
