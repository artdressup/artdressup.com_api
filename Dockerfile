# Base image
FROM node:18.14.2

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY ./bin /app/bin

# Install dependencies
RUN yarn
#RUN yarn global add typescript

# Build project
# RUN yarn build

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "/app/bin/server.js"]