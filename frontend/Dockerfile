# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
