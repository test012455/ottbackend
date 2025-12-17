
pipeline {
  agent any

  environment {
    // If you use SonarQube:
    // SONAR_HOST_URL = credentials('http://localhost:9000')
    // SONAR_TOKEN     = credentials(sonar-token)
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test') {
      steps {
        // Use the Gradle wrapper (Windows batch)
        bat label: 'Gradle build', script: '.\\gradlew.bat clean build --stacktrace'
      }
    }

    stage('SonarQube Analysis') {
      when { not { failed() } }
      steps {
        // If you have SonarQube integration configured:
        // withSonarQubeEnv('SonarQube') {
        //   bat label: 'SonarQube', script: '.\\gradlew.bat sonarqube -Dsonar.login=%SONAR_TOKEN%'
        // }
        echo 'SonarQube stage configured; uncomment when ready.'
      }
    }

    stage('Deploy with Ansible') {
      when { not { failed() } }
      steps {
        echo 'Deployment skipped here; run from a Linux agent or via SSH.'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'build/libs/*.jar', allowEmptyArchive: true
      junit 'build/test-results/test/*.xml'
    }
   }
