pipeline {
    agent any

    tools {
        jdk 'jdk17'
        gradle 'gradle'
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
