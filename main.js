const express = require("express");
const axios = require("axios");
const { DockerComposeEnvironment } = require("testcontainers");
const { ECRClient, GetAuthorizationTokenCommand } = require("@aws-sdk/client-ecr");
const ecrClient = new ECRClient({ region: "ap-south-1" });
const app = express();
const port = 8080;


const { exec } = require('child_process');


async function ecrLoginToken(){
    const input = { // GetAuthorizationTokenRequest
        // registryIds: [ // GetAuthorizationTokenRegistryIdList
        //   "STRING_VALUE",
        // ],
      };

    const authTokenCommand = new GetAuthorizationTokenCommand(input);
    const authorizationResponse = await ecrClient.send(authTokenCommand);
        const authData = authorizationResponse.authorizationData;
        if (authData && authData.length > 0) {
            const authTokenB64 = authData[0].authorizationToken;
            if (!authTokenB64) throw new Error('No token returned by ecr');
            const buffer = Buffer.from(authTokenB64, 'base64');
            return buffer.toString('utf8').split(':')[1];
        }
        throw new Error('No token returned by ecr');
}

async function dockerLogin() {
    const token = await ecrLoginToken();
    const command = `echo ${token} | docker login --username AWS --password-stdin 676768860871.dkr.ecr.ap-south-1.amazonaws.com`;
    console.log(command)
    return;
    return new Promise((resolve, reject) => {
        exec(command, {}, (error, stdout, stderr) => {
            console.log(stderr);
            if (error) {
                console.log(error);
                reject(error);
                return;
            }
            console.log(stdout);
            resolve();
        });
    });
}

function runDockerCommand(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Output: ${stdout}`);
    });
}



async function startContainer() {
  const env = await new DockerComposeEnvironment("./", "docker-compose.yml")
    .withStartupTimeout(120000)
    .up();
  return env;
}

app.get("/api/docker-status", async (req, res) => {
    runDockerCommand('docker ps');
    res.send("Docker status checked");
});


app.get("/api/docker-login", async (req, res) => {
    await dockerLogin();
    res.send("Docker logged in");
});

app.get("/api/call-external", async (req, res) => {
    let envStart = null;
  try {
    try {
        await dockerLogin();
      envStart = await startContainer();
    } catch (envError) {
      console.error(envError);
    }
    const response = await axios.get("http://localhost:3000/api/data");
    if(envStart) {
      await envStart.down();
    }
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
