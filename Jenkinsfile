pipeline {

    agent any
 
    tools {

        jdk 'jdk-17'

        gradle 'Gradle'

    }
 
    environment {

        SONAR_PROJECT_KEY  = 'ott-backend'

        SONAR_PROJECT_NAME = 'ott-backend'

        ANSIBLE_PLAYBOOK   = 'ansible/deploy.yml'

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
 
stage('Deploy with Ansible') {

    steps {

        bat '''

        echo Running Ansible Deployment...

        wsl ansible-playbook %ANSIBLE_PLAYBOOK% -i ansible/inventory.ini ^

        --extra-vars "workspace=%WORKSPACE%"

        '''

    }

}

    }

}
 
