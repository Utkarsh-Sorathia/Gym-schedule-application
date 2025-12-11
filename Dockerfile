# 1. Use official Node.js image
FROM node:20-alpine AS builder

WORKDIR /app

# 2. Copy package files
COPY package.json package-lock.json* ./

# 3. Install dependencies
RUN npm ci

# 4. Copy entire app
COPY . .

# 5. Build for production
RUN npm run build

# 6. Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder stage
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
