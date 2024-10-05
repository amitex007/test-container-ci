const express = require("express");
const axios = require("axios");
const { DockerComposeEnvironment } = require("testcontainers");

const app = express();
const port = 8080;


const { exec } = require('child_process');

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

app.get("/api/docker-status", (req, res) => {
    runDockerCommand('docker ps');
    res.send("Docker status checked");
});

app.get("/api/call-external", async (req, res) => {
    let envStart = null;
  try {
    try {
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
