pipeline {
    agent any

    tools {
        jdk 'jdk17'
    }
    
tools {
    gradle 'gradle'
}

bat 'gradle clean build'
    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Build & Test') {
            steps {
                bat 'gradle'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Local') {
                    bat 'gradle.bat sonarqube -Dsonar.login=%SONAR_TOKEN%'
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                bat '''
                wsl ansible-playbook ansible/deploy.yml ^
                -i ansible/inventory.ini ^
                --extra-vars "workspace=%WORKSPACE%"
                '''
            }
        }
    }
}
