# Stage 1: Build the NestJS application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the NestJS project
RUN npm run build

# Stage 2: Create a production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application and database file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database.sqlite ./database.sqlite

# Expose the port
EXPOSE 8080

# Run the application
CMD ["node", "dist/main"]
