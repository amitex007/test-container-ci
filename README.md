# TestContainers with AWS CodeBuild

This repository contains a script to integrate **TestContainers** with **AWS CodeBuild** for running containerized integration tests during the build process. TestContainers provide lightweight, throwaway instances of common databases, Selenium web browsers, or anything else that can run in a Docker container, making it ideal for integration testing in CI/CD pipelines.

---

## Features
- Use custom image for test container to spin up local instances of services including databases
---

## Prerequisites
1. **AWS Account** with permissions to create and manage CodeBuild projects.
2. **Docker** must be enabled in the AWS CodeBuild environment.

---

## Getting Started

The server is written in nodejs
