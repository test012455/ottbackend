pipeline {
    agent any
 
    tools {
        jdk 'jdk-17'
        gradle 'Gradle'
    }
 
    stages {
 
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ramky3064/ottbackend-testcase.git'
            }
        }
 
        stage('Gradle Clean') {
            steps {
                bat 'gradle clean'
            }
        }
 
        stage('Build & Test') {
            steps {
                bat 'gradle build'
            }
        }
 
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'gradle sonar'
                }
            }
        }
 
        stage('Deploy using Ansible') {
            steps {
                bat '''
                wsl ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
                '''
            }
        }
    }
 
    post {
        success {
            echo '✅ Build, Quality Check & Deployment successful!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
