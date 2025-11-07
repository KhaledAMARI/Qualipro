# Use Node LTS
FROM node:20-alpine

COPY . .

WORKDIR /app
# Install dependencies
RUN npm install -f

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
