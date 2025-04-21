import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';


// Models and Services
import { Assignment } from '../../../core/models/assignment';
import { Subject } from '../../../core/models/subject';
import { AssignmentsService } from '../../../core/services/assignments.service';
import { SubjectService } from '../../../core/services/subject.service';
import { NotificationService } from '../../../core/services/notification.service';

// Components
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { ClassService } from '../../../core/services/class.service';
import { Class } from '../../../core/models/class';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true}
    }
  ],
  templateUrl: './assignment-form.component.html',
  styleUrls: ['./assignment-form.component.css']
})
export class AssignmentFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private assignmentsService = inject(AssignmentsService);
  private subjectService = inject(SubjectService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  assignmentForm!: FormGroup;
  assignment: Assignment | null = null;
  subjects: Subject[] = [];
  isEditMode = false;
  loading = false;
  saveLoading = false;
  
  minDate = new Date(); // La date minimum pour le rendu est aujourd'hui
  
  private classService = inject(ClassService);
  private authService = inject(AuthService);
  classes: Class[] = [];
  
  ngOnInit(): void {
    this.initForm();
    this.loadSubjects();
    this.loadClasses(); // Nouvelle méthode
  }
  
  loadClasses(): void {
    this.classService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes', error);
        this.notificationService.error('Impossible de charger les classes');
      }
    });
  }
  
  initForm(): void {
    this.assignmentForm = this.formBuilder.group({
      generalInfo: this.formBuilder.group({
        nom: ['', [Validators.required, Validators.minLength(3)]],
        matiere: [null, Validators.required],
        dateDeRendu: ['', Validators.required],
        classId: ['', Validators.required] // Nouveau champ
      }),
      detailsInfo: this.formBuilder.group({
        auteur: ['', Validators.required],
        rendu: [false],
        note: [null, [Validators.min(0), Validators.max(20)]],
        remarques: ['']
      })
    });
  }
  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        console.log('Matières chargées:', this.subjects);
        this.loading = false;
        
        // Vérifier s'il s'agit d'une édition
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.isEditMode = true;
          this.loadAssignment(id);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières', error);
        this.notificationService.error('Impossible de charger les matières');
        this.loading = false;
      }
    });
  }

  loadAssignment(id: string): void {
    this.loading = true;
    this.assignmentsService.getAssignment(id).subscribe({
      next: (assignment) => {
        console.log('Assignment chargé:', assignment);
        this.assignment = assignment;
        this.patchFormValues();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'assignment', error);
        this.notificationService.error('Impossible de charger les détails de l\'assignment');
        this.loading = false;
        this.router.navigate(['/assignments']);
      }
    });
  }

  patchFormValues(): void {
    if (!this.assignment) return;
    
    // Trouver l'objet matière complet dans la liste des matières
    let matiereObj = null;
    
    if (typeof this.assignment.matiere === 'object' && this.assignment.matiere) {
      // Si c'est déjà un objet avec un id
      const matiereId = this.assignment.matiere.id || '';
      matiereObj = this.subjects.find(s => s.id === matiereId) || null;
    } else if (this.assignment.matiere) {
      // Si c'est un ID (string)
      const matiereId = String(this.assignment.matiere);
      matiereObj = this.subjects.find(s => s.id === matiereId) || null;
    }
    
    console.log('Matière trouvée:', matiereObj);
    
    // Extraire l'auteur 
    let auteur = '';
    if (typeof this.assignment.auteur === 'object' && this.assignment.auteur) {
      auteur = this.assignment.auteur.username || '';
    } else {
      auteur = String(this.assignment.auteur || '');
    }
    
    // Convertir la date si nécessaire
    let dateDeRendu = this.assignment.dateDeRendu;
    if (typeof dateDeRendu === 'string') {
      dateDeRendu = new Date(dateDeRendu);
    }
    
    // Mettre à jour le formulaire
    this.assignmentForm.patchValue({
      generalInfo: {
        nom: this.assignment.nom,
        matiere: matiereObj, // Utiliser l'objet matière complet
        dateDeRendu: dateDeRendu
      },
      detailsInfo: {
        auteur: auteur,
        rendu: this.assignment.rendu,
        note: this.assignment.note,
        remarques: this.assignment.remarques
      }
    });
  }

  // Méthode de comparaison pour la sélection de matière
  compareSubjects(subject1: any, subject2: any): boolean {
    // Si les deux sont null ou undefined, ils sont égaux
    if (!subject1 && !subject2) return true;
    
    // Si un seul est null ou undefined, ils ne sont pas égaux
    if (!subject1 || !subject2) return false;
    
    // Comparer les IDs (utiliser la propriété id, pas _id)
    return subject1.id === subject2.id;
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      return;
    }
    
    this.saveLoading = true;
    
    // Récupérer les valeurs du formulaire
    const generalInfo = this.assignmentForm.get('generalInfo')?.value;
    const detailsInfo = this.assignmentForm.get('detailsInfo')?.value;
    
    // Important: Extraire l'ID de matière correctement
    let matiereId = '';
    if (generalInfo.matiere) {
      // Si c'est un objet avec id (comme attendu)
      if (typeof generalInfo.matiere === 'object' && generalInfo.matiere !== null) {
        if (generalInfo.matiere.id) {
          matiereId = generalInfo.matiere.id;
          console.log('ID matière extrait de l\'objet:', matiereId);
        } else {
          // Cas peu probable mais géré par sécurité
          console.error('Objet matière sans propriété id:', generalInfo.matiere);
          this.notificationService.error('Erreur: Impossible d\'identifier la matière sélectionnée');
          this.saveLoading = false;
          return;
        }
      } else {
        // Si ce n'est pas un objet mais directement un ID sous forme de chaîne
        matiereId = String(generalInfo.matiere);
        console.log('ID matière déjà sous forme de chaîne:', matiereId);
      }
    }
    
    // Vérification supplémentaire: s'assurer que l'ID matière est défini et n'est pas "[object Object]"
    if (!matiereId || matiereId === "[object Object]") {
      console.error('ID matière invalide:', matiereId);
      this.notificationService.error('Veuillez sélectionner une matière valide');
      this.saveLoading = false;
      return;
    }
    
    console.log('ID matière final:', matiereId);
    
    const assignmentData: Assignment = {
      nom: generalInfo.nom,
      matiere: matiereId, // Utiliser l'ID extrait
      dateDeRendu: generalInfo.dateDeRendu,
      auteur: detailsInfo.auteur,
      rendu: detailsInfo.rendu,
      note: detailsInfo.note,
      remarques: detailsInfo.remarques,
      id: this.isEditMode && this.assignment?.id ? this.assignment.id : '',
      createdAt: this.assignment?.createdAt,
      updatedAt: this.assignment?.updatedAt,
      classId: generalInfo.classId, // Ajoutez cette ligne pour inclure l'ID de la classe
      attachments: this.assignment?.attachments || [] // Il faut aussi inclure ce champ si vous l'avez ajouté
    };
    console.log('Données à envoyer:', JSON.stringify(assignmentData, null, 2));
    
    // Si l'assignment est marqué comme rendu, vérifier qu'il a une note
    if (detailsInfo.rendu && !detailsInfo.note) {
      this.notificationService.error('Impossible de marquer comme rendu : aucune note attribuée');
      this.saveLoading = false;
      return;
    }
    
    if (this.isEditMode && this.assignment) {
      this.updateAssignment(assignmentData);
    } else {
      this.createAssignment(assignmentData);
    }
  }

  createAssignment(assignment: Assignment): void {
    // Supprimer l'ID vide pour la création
    const assignmentToCreate = {...assignment};
    // delete assignmentToCreate?.id;
    
    console.log('Création d\'un assignment avec les données:', assignmentToCreate);
    this.assignmentsService.addAssignment(assignmentToCreate).subscribe({
      next: (createdAssignment) => {
        this.notificationService.success('Assignment créé avec succès');
        this.saveLoading = false;
        this.router.navigate(['/assignments', createdAssignment.id]);
      },
      error: (error) => {
        console.error('Erreur lors de la création de l\'assignment', error);
        this.notificationService.error('Impossible de créer l\'assignment');
        this.saveLoading = false;
      }
    });
  }

  updateAssignment(assignment: Assignment): void {
    console.log('Mise à jour d\'un assignment avec les données:', assignment);
    this.assignmentsService.updateAssignment(assignment).subscribe({
      next: (updatedAssignment) => {
        this.notificationService.success('Assignment mis à jour avec succès');
        this.saveLoading = false;
        this.router.navigate(['/assignments', updatedAssignment.id]);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de l\'assignment', error);
        this.notificationService.error('Impossible de mettre à jour l\'assignment');
        this.saveLoading = false;
      }
    });
  }

  onCancel(): void {
    // Confirmer l'annulation si le formulaire a été modifié
    if (this.assignmentForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Annuler les modifications',
          message: 'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
          confirmText: 'Oui, annuler',
          cancelText: 'Non, continuer'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  navigateBack(): void {
    this.location.back();
  }

  getSubjectName(subjectId: string): string {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject ? subject.name : '';
  }
}