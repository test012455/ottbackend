pipeline {
    agent any

    tools {
        jdk 'jdk-17'
        gradle 'Gradle'
    }

    environment {
        SONAR_SCANNER_OPTS = "-Xmx512m"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'gradle clean build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                    gradle sonarqube ^
                      -Dsonar.projectKey=ott-backend ^
                      -Dsonar.projectName=ott-backend ^
                      -Dsonar.host.url=http://localhost:9000 ^
                      -Dsonar.login=%SONAR_AUTH_TOKEN%
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                echo Deploying application...
                mkdir C:\\apps\\ott-backend 2>nul
                copy /Y build\\libs\\*.jar C:\\apps\\ott-backend\\ott-backend.jar
                start "" java -jar C:\\apps\\ott-backend\\ott-backend.jar
                '''
            }
        }
    }
}
