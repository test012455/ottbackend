pipeline {
    agent any

    tools {
        jdk 'jdk17'
        gradle 'gradle'
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Checkout Code') {
    steps {
        git branch: 'main',
            url: 'https://github.com/test012455/ottbackend.git'
    }
}


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
                --extra-vars "workspace=%WORKSPACE%"
                '''
            }
        }
    }
}

