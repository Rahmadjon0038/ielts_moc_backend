FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN apk add --no-cache python3 make g++ \
  && npm ci --omit=dev \
  && apk del python3 make g++

# Copy source
COPY . .

# Ensure uploads directory exists at build time
RUN mkdir -p public/uploads

ENV PORT=4011
EXPOSE 4011

CMD ["node", "server.js"]
