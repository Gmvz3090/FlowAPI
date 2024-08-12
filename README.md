# FlowAPI
 API for Flow Project
 Endpoints :

 - /api/croom
   Creates a 'x' long random room key, and puts it into MySQL Database.

 - /api/join/?id
   Joins or tries to join a room that's key id is equal to ?id by searching for a room key in MySQL Database.

 Features :

 - Detects last used id, and sets the current id as last_id + 1.
