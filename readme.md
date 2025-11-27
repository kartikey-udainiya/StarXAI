Instruction
StarXAI is a background job processing system that allows authenticated users to create tasks (jobs) and track their progress in real time. Jobs are queued and processed asynchronously based on priority using BullMQ. PostgreSQL is used as the primary database, Redis is used for caching and queue management, and Socket.IO provides live updates of job status on the dashboard without manual refresh. The entire application is Docker-ready and supports scalable backend worker processing.

Project Features
    1. JWT Authentication
    2. Create Jobs with Priority
    3. 3Background Processing (BullMQ Worker)
    4. PostgreSQL Storage  
    5. Redis Caching --> deacreasing Latency upto 96% ( average 130-140ms to 10 to 15ms)
    6. Socket.IO Based Realtime Status Updates
    7. Rate Limiting Middleware

Dockerized Full Stack
First clone this Git repo --> https://github.com/kartikey-udainiya/StarXAI.git 


#How to run the Project with docker?
Ans:

1. Requirement
    a.) Postgres
    b.) Redis
    c.) Node

2. Go in the folder directory Create a file in the root directory --> .env
3. Copy the content of the File env-example-Without-Docker and paste it in the newly created .env file.

    a.) After pasting change the values of the Postgres and redis as per your system
         (carefully look at the Postgres env and follow the instructions)

        PGUSER=postgres
        PGHOST=localhost
        PGDATABASE=starX     <---- Create DataBase w/ this name in the Postgres.
        PGPASSWORD=123456  <---- Enter your Postgres password.
        PGPORT=1234   <---- set this port as per you Postgres Port.

4. Install the dependencies ->  npm install
5. Now run the server with this command --> npm run start:api
6. And Run the worker in other terminal --> npm run start:worker
7. Open the Browser --> and type the URL --> localhost:3000/home


#How to run the Project with docker?
Ans:

1. Requirement
    a.) Docker daemon
2. Go in the folder directory Create a file in the root directory --> .env
3. Copy the content of the File env-example-With-Docker and paste it in the newly created .env file. 
4. And Run the commmand. --> docker-compose up --build
5. Open the browser and type the URL --> localhost:3000/home
