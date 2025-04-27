import { Component, Input, OnInit, signal } from '@angular/core';
import { WorkExperienceInterface } from '../../interfaces/interfaces.models';
import { WorkService } from '../../services/work/work.service';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-work-section',
  imports: [],
  templateUrl: './work-section.component.html',
  styleUrl: './work-section.component.css'
})
export class WorkSectionComponent implements OnInit {

  latestWork = signal<WorkExperienceInterface[]>([]);
  @Input() userId: number | null = null;

  constructor(private workService: WorkService) { }

  ngOnInit(): void {

    if (this.userId) {

      this.workService.getDataWorkByUserId(this.userId)
        .subscribe({
          next: (work: WorkExperienceInterface[]) => {
            this.latestWork.update((currentwork) => [...currentwork, ...work]);
          },
          error: (error) => {
            console.error("Error al obtener las experiencias laborales:", error);
            this.latestWork.set([]);
          }
        });
    }else {

      console.error("the user id is null")
    }

  }

}
