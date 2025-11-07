# Dev mode image
FROM node:20-alpine
WORKDIR /app

# Install dependencies (including devDependencies for Quasar CLI)
COPY package.json ./
COPY package-lock.json ./

# Copy source
COPY . .
RUN npm install

# Expose Quasar dev server port
EXPOSE 9000

# Run Quasar dev bound to 0.0.0.0 on port 9000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "9000"]
