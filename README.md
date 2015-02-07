As we are moving towards a complete API / micro-services based architecture, there is a need for the clients to keep polling for new data / do a periodic data fetch from multiple systems, as everything is loosely coupled. This is an accepted approach, but if we can provide a beacon/poke to our client systems whenever there is new data available, the entire ecosystem will work in a more near real time scenario. 
Presented below is a solution for Real Time Notification to the PubMatic UI currently, but this solution can be easily extended to push notification to other UI's on the partner sides, who are only using our API's. ( Web / Mobile )
The solution is more in-line with Apple APNS / Google GCM, where notifications are pushed from the backend server of any applicatoin to the particular user and device through APNS / GCM server.
1. We will have real time components created in UI, which will be normal components with a small piece of code embedded to make them realtime. 
2. Once these components are loaded in UI, they will register themselves with the RTNS server.
3. The backend servers like (API / Mgmt) will make a POST call to the RTNS server, everytime they want to push some notification to a particular user/component on the UI. This includes UserId, UserType (PUB/DSP/External), ComponentId, callBackAPI.
4. RTNS server checks if the user is currently online, and in-case the user is online delivers the callBackAPI to the component. Incase the user is not logged in currently or the component is not being displayed on the UI, the RTNS server saves the notification for later delivery. There will be a 2-3 min loop which keeps checking for these saved notifications, and delivers whichever are applicable.
5. In case the component and user are online, then the RTNS server send a notification to the component with the callBackAPI.
6. As soon as the component receives the callBackAPI, it calls the API and fetches latest data.

