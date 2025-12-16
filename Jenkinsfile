pipeline {
    agent any

    tools {
        jdk 'jdk17'
        gradle 'gradle'
    }

    environment {
        SONARQUBE_ENV = 'SonarQube'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/test012455/ottbackend.git'
            }
        }

        stage('Build with Gradle') {
            steps {
                bat 'gradle clean build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'gradle sonar'
                }
            }
        }
    }
}
