# Application de Gestion des Assignments ESATIC

Ce projet est une application de gestion des assignments pour ESATIC, composée d'un backend en Java Spring Boot et d'un frontend en Angular TypeScript.

## Structure du projet

- **Backend** : API REST avec Java Spring Boot
- **Frontend** : Interface utilisateur avec Angular TypeScript

## Liens des dépôts GitHub

- Frontend : [https://github.com/AKDEV02/FrontEndAssignmentEsatic-2024-2025.git](https://github.com/AKDEV02/FrontEndAssignmentEsatic-2024-2025.git)
- Backend : [https://github.com/AKDEV02/BackEndAssignmentEsatic-2024-2025.git](https://github.com/AKDEV02/BackEndAssignmentEsatic-2024-2025.git)

## Prérequis

- Java 11 ou supérieur
- Maven
- Node.js et npm
- Angular CLI

## Installation et lancement du backend (Spring Boot)

1. Cloner le dépôt backend :
   ```bash
   git clone https://github.com/AKDEV02/BackEndAssignmentEsatic-2024-2025.git
   cd BackEndAssignmentEsatic-2024-2025
   ```

2. Configurer la clé API Mockaroo :
   Dans le fichier `SetupController.java`, si nécessaire, remplacez la clé API Mockaroo par la vôtre ou utilisez celle qui est déjà configurée.

3. Compiler et exécuter le projet :
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. Le serveur backend sera accessible à l'URL : http://localhost:8080

5. **Important** : Générer les données initiales en visitant l'URL suivante dans votre navigateur ou en utilisant un client REST comme Postman :
   ```
   http://localhost:8080/api/api/setup/init-mockaroo?force=true&useCache=false
   ```

## Installation et lancement du frontend (Angular)

1. Cloner le dépôt frontend :
   ```bash
   git clone https://github.com/AKDEV02/FrontEndAssignmentEsatic-2024-2025.git
   cd FrontEndAssignmentEsatic-2024-2025
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Lancer l'application Angular :
   ```bash
   ng serve
   ```

4. Le frontend sera accessible à l'URL : http://localhost:4200

## Connexion à l'application

Après avoir généré les données initiales, vous pouvez vous connecter à l'application avec les identifiants suivants :

```
Nom d'utilisateur : admin
Mot de passe : admin123
```

## Problèmes courants et solutions

- Si vous rencontrez des problèmes de CORS, assurez-vous que le backend est correctement configuré pour accepter les requêtes du frontend.
- En cas d'erreur de connexion à la base de données, vérifiez les paramètres de connexion dans le fichier `application.properties` du backend.
- Si les données ne sont pas générées correctement, vérifiez que la clé API Mockaroo est valide.

## Technologies utilisées

- **Backend** : Java, Spring Boot, Spring Security, Spring Data JPA
- **Frontend** : Angular, TypeScript, Angular Material
- **Base de données** : mongoDB
- **Génération de données** : Mockaroo API
- **Nom BD** : assignment_db


## Documentation de l'API

La documentation de l'API REST est disponible à l'adresse suivante lorsque le backend est en cours d'exécution :
http://localhost:8080/swagger-ui/index.html

## Membres de l'Equipe 

-KONE ARIEL CHRISTIAN DANY KADER 
-BAMBA ABOUBACAR KADER 
