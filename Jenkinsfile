pipeline {
    agent any

    tools {
        jdk 'jdk17'
        gradle 'gradle'
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token-new')
    }

    stage('Build & Test') {
    steps {
        bat '"%GRADLE_HOME%\\bin\\gradle.bat" clean build'
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
