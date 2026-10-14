FROM node:20-alpine
WORKDIR /app

# Install only production deps first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 5000
CMD ["node", "src/index.js"]
