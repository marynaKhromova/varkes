
#this line is for cli
#node /varkes/app-connector-client/cli.js --token $TOKEN --hostname $HOSTNAME 

#this line is for server
node /varkes/app-connector-client/server/server.js &
echo "connector started and listening at port 4444"
npm start