pipeline {
    agent any

    tools {
        JDK 'jdk17'
        Gradle 'Gradle'
    }

    stages {
        stage('Build') {
            steps {
                bat 'gradle clean build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'gradle sonarqube'
                }
            }
        }
    }
}
