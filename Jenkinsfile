pipeline {
    agent any

    tools {
        jdk 'JDK17'
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/test012455/ottbackend.git'
            }
        }

        stage('Build & Test') {
            steps {
                bat '.\\gradlew.bat clean build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarLocal') {
                    bat """
                    .\\gradlew.bat sonarqube ^
                    -Dsonar.projectKey=local-app ^
                    -Dsonar.login=%SONAR_TOKEN%
                    """
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                bat 'ansible-playbook ansible/deploy.yml -i ansible/inventory.ini'
            }
        }
    }
}
