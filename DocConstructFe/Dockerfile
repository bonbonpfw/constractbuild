# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies (force public registry, clear any auth)
RUN rm -f /root/.npmrc \
  && npm config set registry "https://registry.npmjs.org/" \
  && npm config set //registry.npmjs.org/:_authToken "" \
  && npm i

# Copy the rest of the application code
COPY . .

# Build the Next.js app with verbose output
RUN npm run build --verbose

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
