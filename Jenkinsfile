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

                    url: 'https://github.com/test012455/ottbackend.git'

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

    }
   
        stage('Deploy with Ansible') {
        
            steps {
                
                bat 'ansible-playbook ansible/deploy.yml -i ansible/inventory.ini'
                
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
 
