pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        SONAR_HOST_URL = "http://localhost:9000"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-creds',
                    url: 'https://github.com/test012455/ottbackend.git',
                    branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('local-sonar') {
                    bat """
                    npm install -g sonar-scanner
                    sonar-scanner \
                      -Dsonar.projectKey=ottbackend \
                      -Dsonar.sources=src
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                echo "Deploying Application..."
                npm run start:prod &
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
