# Setting Up an LKE Cluster with Prometheus and Grafana Monitoring

This guide will walk you through the process of setting up a Linode Kubernetes Engine (LKE) cluster and deploying a dummy API application, along with Prometheus and Grafana for monitoring.

## Prerequisites

Before you begin, make sure you have the following prerequisites:

1. A Linode account.
2. Linode CLI (`linode-cli`) installed and authenticated.
3. Helm CLI (`helm`) installed.
4. Docker installed on your local machine.
5. Node.js and npm installed on your local machine.

## Step 1: Create LKE Cluster

1. Create an LKE cluster using the Linode Cloud Manager or Linode CLI. For example, using Linode CLI:

   ```bash
   linode-cli k8s-alpha create my-cluster --region us-central --node-type g6-standard-2 --node-count 2
   ```

2. Download the Kubernetes configuration (kubeconfig) for the cluster:

   ```bash
   linode-cli k8s-alpha kubeconfig my-cluster > kubeconfig.yaml
   ```

3. Connect to the cluster using kubectl:

   ```bash
   export KUBECONFIG=kubeconfig.yaml
   ```

## Step 2: Add Helm Repositories

Add the Helm repositories for Prometheus and Grafana:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

## Step 3: Install Helm Charts

Install Prometheus and Grafana using Helm:

```bash
helm install my-prometheus prometheus-community/kube-prometheus-stack
helm install my-grafana grafana/grafana
```

## Step 4: Write the Dummy Application

1. Create a simple Express.js application. You can use the provided `index.js` as a starting point.

2. Initialize a `package.json` file and install necessary dependencies:

   ```bash
   npm init
   npm install express swStats
   ```

3. Copy the `index.js` code into your project.

## Step 5: Dockerize the Application

Create a Dockerfile in your project directory with the following content:

```Dockerfile
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
```

## Step 6: Build and Push Docker Image

1. Build the Docker image:

   ```bash
   docker build -t your-image-name .
   ```

2. Push the Docker image to a container registry of your choice (e.g., Docker Hub).

## Step 7: Deploy the Application to Kubernetes

Create Kubernetes deployment and service YAML files for your application. Ensure you have a ServiceMonitor for Prometheus scraping.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  labels:
    app: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: your-image-name:tag
          ports:
            - containerPort: 8080
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
---
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-monitor
  labels:
    release: my-prometheus
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
    - port: http
```

Apply these YAML files:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f servicemonitor.yaml
```

## Step 8: Expose Prometheus and Grafana UI

Expose Prometheus and Grafana UI using NodePort services:

```bash
kubectl expose service prometheus-kube-prometheus-prometheus --type=NodePort --name=prometheus-ext
kubectl expose service my-grafana --type=NodePort --name=my-grafana-ext --target-port=3000
```

## Step 9: Log in to Grafana

Retrieve the Grafana admin password and login:

```bash
kubectl get secret my-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

Access the Grafana UI at `http://<your-node-IP>:<NodePort>` using the admin username and password.



## Step 10: Configure Prometheus as a Data Source

1. Log in to Grafana.

2. Add a new data source:
   - Name: Prometheus
   - Type: Prometheus
   - URL: http://<Prometheus-Node-IP>:<NodePort>

3. Save and test the data source to ensure it's working.

## Step 11: Import Dashboard

1. In Grafana, click on the "+" icon on the left sidebar and select "Import."

2. Enter `6417` as the Grafana.com Dashboard ID and select the Prometheus data source you configured.

3. Click "Load" to import the dashboard.

You now have a Kubernetes cluster with a dummy API application, Prometheus, and Grafana for monitoring. The imported dashboard should display metrics from your application.

Feel free to customize the application, dashboards, and monitoring setup to suit your needs. Happy monitoring!
