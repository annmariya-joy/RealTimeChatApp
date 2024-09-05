# RealTimeChatApp

* Setup and Installation

npm install

* Configuration

Create a .env file in the root directory of the project.

Add the following environment variables to the .env file:


ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_DIALECT=


* API Documentation

The following API endpoints are available:

User Management

Login

Endpoint: POST /api/users/login
Authorization Header:
Type: Basic Auth
Credentials: email:password (Base64 encoded)
Description: Authenticate a user and receive a JWT token.

Signup

Endpoint: POST /api/users/signup
Body:
json

{
  "user_name": "example",
  "email": "example@example.com",
  "password": "password123"
}
Description: Register a new user.

Messages

Send Message

Endpoint: POST /api/messages/sendMessage
Body:
json

{
  "receiver_id": 2,
  "message_body": "Hello, how are you?"
}
Description: Send a direct message to a user.

View Received Messages

Endpoint: GET /api/messages/received/:userId
Description: Retrieve all messages received by the user with userId.

Groups

Create Group

Endpoint: POST /api/groups/createGroup
Body:
json

{
  "group_name": "Backend Team",
  "members": [1, 2, 3, 4, 5]
}
Description: Create a new group and add members.

Add Members

Endpoint: POST /api/groups/addmembers
Body:
json

{
  "group_id": 7,
  "user_id": 7
}
Description: Add a user to an existing group.

Remove Members

Endpoint: DELETE /api/groups/removemembers
Body:
json

{
  "group_id": 1,
  "user_id": 5
}
Description: Remove a user from a group.

Update Group Settings

Endpoint: PUT /api/groups/updateGroup
Body:
json

{
  "group_id": 1,
  "group_name": "New Group Name"
}
Description: Update group settings such as name.

Delete Group

Endpoint: DELETE /api/groups/deleteGroup
Body:
json

{
  "group_id": 5
}
Description: Delete a group.

Send Message to Group

Endpoint: POST /api/messages/sendGroupMessage
Body:
json

{
  "group_id": 6,
  "message_body": "Hello Group!"
}
Description: Send a message to a group.

View Group Messages

Endpoint: GET /api/messages/1/messages
Description: Retrieve all messages from a specific group.



* Unit Tests

Install Testing Dependencies

npm install --save-dev jest

Test Framework: Jest

Run Tests:

npm test