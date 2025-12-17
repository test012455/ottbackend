pipeline {
    agent any

    tools {
        jdk 'jdk17'
        gradle 'gradle-7.6.5'
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token-new')
    }

    stages {

        stage('Build & Test') {
            steps {
                bat 'gradle clean build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Local') {
                    bat 'gradle sonar'
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                bat '''
                wsl ansible-playbook ansible/deploy.yml \
                -i ansible/inventory.ini \
                --extra-vars "workspace=/mnt/c/ProgramData/Jenkins/.jenkins/workspace/%JOB_NAME%"
                '''
            }
        }
    }
}
