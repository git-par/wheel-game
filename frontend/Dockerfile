# Step 1: Use the official Node.js 20 image as the base
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install -f

# Step 5: Copy the rest of your application's code
COPY . .

# Step 6: Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 3238

# Step 8: Start the application
CMD ["npm", "run", "start"]